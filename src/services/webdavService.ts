/**
 * WebDAV 备份与还原服务
 */

import { createClient, type WebDAVClient } from 'webdav';
import { db } from '@/db/schema';
import JSZip from 'jszip';

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
        if (attachmentsFolder) {
          attachmentsFolder.file(attachment.id, attachment.blob);
        }
      }

      // 导出 localStorage 中的设置数据
      const settings: Record<string, any> = {};
      // 导出 WebDAV 配置
      const webdavConfig = localStorage.getItem('webdav_config');
      if (webdavConfig) {
        settings['webdav_config'] = JSON.parse(webdavConfig);
      }
      // 导出布局设置
      const canvasRatio = localStorage.getItem('layout.canvasPanelWidthRatio');
      const editorHeightRatio = localStorage.getItem('layout.editorHeightRatio');
      const sidebarCollapsed = localStorage.getItem('layout.sidebarCollapsed');
      if (canvasRatio) settings['layout.canvasPanelWidthRatio'] = JSON.parse(canvasRatio);
      if (editorHeightRatio) settings['layout.editorHeightRatio'] = JSON.parse(editorHeightRatio);
      if (sidebarCollapsed) settings['layout.sidebarCollapsed'] = JSON.parse(sidebarCollapsed);
      
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
  async listBackups(): Promise<Array<{ name: string; path: string; size: number; lastMod: string }>> {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      const dirPath = `/${WEBDAV_DIR}/`
      const exists = await this.client.exists(dirPath);

      if (!exists) {
        return [];
      }

      const contents = await this.client.getDirectoryContents(dirPath);
      console.log(`contents: ${JSON.stringify(contents)}`)

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
   * 从 WebDAV 还原数据
   */
  async restoreFromWebDAV(remotePath: string): Promise<void> {
    if (!this.client) {
      throw new Error('请先配置 WebDAV 连接');
    }

    try {
      // 1. 从 WebDAV 下载文件
      const arrayBuffer = (await this.client.getFileContents(remotePath, {
        format: 'binary',
      })) as ArrayBuffer;

      // 2. 解析 ZIP
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 3. 读取数据文件
      const projectsFile = zip.file('projects.json');
      const foldersFile = zip.file('folders.json');
      const versionsFile = zip.file('versions.json');
      const snippetsFile = zip.file('snippets.json');
      const attachmentsFile = zip.file('attachments.json');
      const settingsFile = zip.file('settings.json');

      // 4. 清空现有数据（可选，根据需求决定是否合并）
      const shouldClear = confirm('是否清空现有数据后还原？（取消则合并数据）');
      if (shouldClear) {
        await db.transaction('rw', db.projects, db.folders, db.versions, db.snippets, db.attachments, async () => {
          await db.projects.clear();
          await db.folders.clear();
          await db.versions.clear();
          await db.snippets.clear();
          await db.attachments.clear();
        });
      }

      // 5. 导入数据
      if (projectsFile) {
        const projects = JSON.parse(await projectsFile.async('text'));
        await db.projects.bulkPut(projects);
      }

      if (foldersFile) {
        const folders = JSON.parse(await foldersFile.async('text'));
        await db.folders.bulkPut(folders);
      }

      if (versionsFile) {
        const versions = JSON.parse(await versionsFile.async('text'));
        await db.versions.bulkPut(versions);
      }

      if (snippetsFile) {
        const snippets = JSON.parse(await snippetsFile.async('text'));
        await db.snippets.bulkPut(snippets);
      }

      if (attachmentsFile) {
        const attachmentMetadata = JSON.parse(await attachmentsFile.async('text'));
        const attachmentsFolder = zip.folder('attachments');

        if (attachmentsFolder) {
          const attachments = await Promise.all(
            attachmentMetadata.map(async (meta: any) => {
              const blobFile = attachmentsFolder.file(meta.id);
              if (blobFile) {
                const blob = await blobFile.async('blob');
                return {
                  ...meta,
                  blob,
                };
              }
              return null;
            })
          );

          const validAttachments = attachments.filter((att) => att !== null);
          await db.attachments.bulkPut(validAttachments as any[]);
        }
      }

      // 6. 导入设置数据
      if (settingsFile) {
        const settings = JSON.parse(await settingsFile.async('text'));
        // 恢复 WebDAV 配置（除了当前使用的配置）
        if (settings['webdav_config'] && shouldClear) {
          // 保留当前 WebDAV 配置，不覆盖
          // localStorage.setItem('webdav_config', JSON.stringify(settings['webdav_config']));
        }
        // 恢复布局设置
        if (settings['layout.canvasPanelWidthRatio'] !== undefined) {
          localStorage.setItem('layout.canvasPanelWidthRatio', JSON.stringify(settings['layout.canvasPanelWidthRatio']));
        }
        if (settings['layout.editorHeightRatio'] !== undefined) {
          localStorage.setItem('layout.editorHeightRatio', JSON.stringify(settings['layout.editorHeightRatio']));
        }
        if (settings['layout.sidebarCollapsed'] !== undefined) {
          localStorage.setItem('layout.sidebarCollapsed', JSON.stringify(settings['layout.sidebarCollapsed']));
        }
      }

      console.log('数据还原成功');
    } catch (error) {
      console.error('WebDAV 还原失败:', error);
      throw new Error(`还原失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
