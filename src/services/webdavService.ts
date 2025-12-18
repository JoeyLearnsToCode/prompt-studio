/**
 * WebDAV 备份与还原服务
 */

import { createClient, type WebDAVClient } from 'webdav';
import { db } from '@/db/schema';
import JSZip from 'jszip';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { importService } from './importService';
import { ImportOptions, ImportProgressCallback } from '@/types/import';

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

const WEBDAV_DIR = 'prompt-studio-backups';

export class WebDAVService {
  private client: WebDAVClient | null = null;
  private config: WebDAVConfig | null = null;

  /**
   * 配置 WebDAV 客户端
   */
  configure(config: WebDAVConfig): void {
    this.config = config;
    this.client = createClient(config.url, {
      username: config.username,
      password: config.password,
    });
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      await this.client.exists('/');
      return true;
    } catch (error) {
      console.error('WebDAV 连接测试失败:', error);
      return false;
    }
  }

  /**
   * 备份所有数据到 WebDAV
   */
  async backupToWebDAV(): Promise<void> {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      // 1. 导出所有数据
      const zip = new JSZip();

      const projects = await db.projects.toArray();
      const folders = await db.folders.toArray();
      const versions = await db.versions.toArray();
      const snippets = await db.snippets.toArray();
      const attachments = await db.attachments.toArray();

      zip.file('projects.json', JSON.stringify(projects, null, 2));
      zip.file('folders.json', JSON.stringify(folders, null, 2));
      zip.file('versions.json', JSON.stringify(versions, null, 2));
      zip.file('snippets.json', JSON.stringify(snippets, null, 2));

      // 附件单独保存（不包含 blob，仅元数据）
      const attachmentMetadata = attachments.map((att) => ({
        id: att.id,
        versionId: att.versionId,
        fileName: att.fileName,
        fileType: att.fileType,
      }));
      zip.file('attachments.json', JSON.stringify(attachmentMetadata, null, 2));

      // 附件 blob 保存到单独的文件夹
      const attachmentsFolder = zip.folder('attachments');
      for (const attachment of attachments) {
        if (attachmentsFolder && attachment.blob) {
          attachmentsFolder.file(attachment.id, attachment.blob);
        }
      }

      // 导出 localStorage 中的设置数据
      const settings: Record<string, any> = {};
      // 导出 WebDAV 配置
      const webdavConfig = storage.get(STORAGE_KEYS.WEBDAV_CONFIG, null);
      if (webdavConfig) {
        settings[STORAGE_KEYS.WEBDAV_CONFIG] = webdavConfig;
      }
      // 导出布局设置
      const canvasRatio = storage.get(STORAGE_KEYS.CANVAS_RATIO, null);
      const editorHeightRatio = storage.get(STORAGE_KEYS.EDITOR_HEIGHT_RATIO, null);
      const sidebarCollapsed = storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, null);
      if (canvasRatio !== null) settings[STORAGE_KEYS.CANVAS_RATIO] = canvasRatio;
      if (editorHeightRatio !== null)
        settings[STORAGE_KEYS.EDITOR_HEIGHT_RATIO] = editorHeightRatio;
      if (sidebarCollapsed !== null) settings[STORAGE_KEYS.SIDEBAR_COLLAPSED] = sidebarCollapsed;

      zip.file('settings.json', JSON.stringify(settings, null, 2));

      zip.file(
        'metadata.json',
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            counts: {
              projects: projects.length,
              folders: folders.length,
              versions: versions.length,
              snippets: snippets.length,
              attachments: attachments.length,
            },
          },
          null,
          2
        )
      );

      // 2. 生成 ZIP
      const blob = await zip.generateAsync({ type: 'blob' });

      // 3. 上传到 WebDAV
      const filename = `prompt-studio-backup-${Date.now()}.zip`;
      const remotePath = `/${WEBDAV_DIR}/${filename}`;

      // 确保目录存在
      try {
        await this.client.createDirectory(`/${WEBDAV_DIR}`);
      } catch (error) {
        // 目录可能已存在，忽略错误
      }

      const arrayBuffer = await blob.arrayBuffer();
      await this.client.putFileContents(remotePath, arrayBuffer);

      console.log(`备份成功: ${remotePath}`);
    } catch (error) {
      console.error('WebDAV 备份失败:', error);
      throw new Error(`备份失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 列出所有备份文件
   */
  async listBackups(): Promise<
    Array<{ name: string; path: string; size: number; lastMod: string }>
  > {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      const dirPath = `/${WEBDAV_DIR}/`;
      const exists = await this.client.exists(dirPath);

      if (!exists) {
        return [];
      }

      const contents = await this.client.getDirectoryContents(dirPath);
      console.log(`contents: ${JSON.stringify(contents)}`);

      return (contents as any[])
        .filter((item) => item.type === 'file' && item.basename.endsWith('.zip'))
        .map((item) => ({
          name: item.basename,
          path: item.filename,
          size: item.size,
          lastMod: item.lastmod,
        }))
        .sort((a, b) => new Date(b.lastMod).getTime() - new Date(a.lastMod).getTime());
    } catch (error) {
      console.error('获取备份列表失败:', error);
      throw new Error(`获取备份列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
  /**
   * 从 WebDAV 还原数据（使用新的导入服务）
   */
  async restoreFromWebDAV(
    remotePath: string,
    options: ImportOptions,
    onProgress?: ImportProgressCallback
  ): Promise<void> {
    const result = await importService.importFromWebDAV(this, remotePath, options, onProgress);
    if (!result.success) {
      throw new Error(result.message);
    }
  }

  /**
   * 删除远程备份
   */
  async deleteBackup(remotePath: string): Promise<void> {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      await this.client.deleteFile(remotePath);
      console.log(`删除备份成功: ${remotePath}`);
    } catch (error) {
      console.error('删除备份失败:', error);
      throw new Error(`删除备份失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): WebDAVConfig | null {
    return this.config;
  }

  /**
   * 清除配置
   */
  clearConfig(): void {
    this.client = null;
    this.config = null;
  }
}

export const webdavService = new WebDAVService();
