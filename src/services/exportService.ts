/**
 * 数据导入导出服务
 */

import { db } from '@/db/schema';
import JSZip, { type JSZipGeneratorOptions } from 'jszip';
import { saveAs } from 'file-saver';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { importService } from './importService';
import type { ImportOptions, ImportProgressCallback } from '@/types/import';

export const zipGenOptions: JSZipGeneratorOptions<'blob'> = { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } };

export class ExportService {
  /**
   * 导出单个项目为 JSON
   */
  async exportProjectAsJSON(projectId: string): Promise<void> {
    const project = await db.projects.get(projectId);
    const versions = await db.versions.where('projectId').equals(projectId).toArray();
    const attachments = await db.attachments
      .where('versionId')
      .anyOf(versions.map((v) => v.id))
      .toArray();

    // 清理版本数据，移除运行时计算的字段
    const cleanVersions = versions.map(({ normalizedContent, ...version }) => version);

    // 清理附件数据，移除 blob 字段（因为 JSON 无法序列化 Blob）
    const cleanAttachments = attachments.map(({ blob, isMissing, ...attachment }) => ({
      ...attachment,
      // 保留原始文件名和类型信息，但不包含实际二进制数据
      hasBlob: !!blob && !isMissing,
    }));

    const data = {
      project,
      versions: cleanVersions,
      attachments: cleanAttachments,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${project?.name || 'project'}_${Date.now()}.json`);
  }

  /**
   * 导出所有数据为 ZIP
   */
  async exportAllAsZip(): Promise<void> {
    const zip = new JSZip();

    const projects = await db.projects.toArray();
    const folders = await db.folders.toArray();
    const versions = await db.versions.toArray();
    const snippets = await db.snippets.toArray();
    const attachments = await db.attachments.toArray();

    // 清理版本数据，移除运行时计算的字段
    const cleanVersions = versions.map(({ normalizedContent, ...version }) => version);

    // 清理附件数据，移除 blob 字段
    const cleanAttachments = attachments.map(({ blob, isMissing, ...attachment }) => ({
      ...attachment,
      // 保留原始文件名和类型信息，但不包含实际二进制数据
      hasBlob: !!blob && !isMissing,
    }));

    zip.file('projects.json', JSON.stringify(projects, null, 2));
    zip.file('folders.json', JSON.stringify(folders, null, 2));
    zip.file('versions.json', JSON.stringify(cleanVersions, null, 2));
    zip.file('snippets.json', JSON.stringify(snippets, null, 2));
    zip.file('attachments.json', JSON.stringify(cleanAttachments, null, 2));

    // 添加附件文件到 ZIP 的 attachments 子目录
    const attachmentsFolder = zip.folder('attachments');
    if (attachmentsFolder) {
      for (const attachment of attachments) {
        if (attachment.blob && !attachment.isMissing) {
          // 获取文件扩展名
          const fileExtension = ExportService.getFileExtension(
            attachment.fileType,
            attachment.fileName
          );
          const fileName = `${attachment.id}${fileExtension}`;

          // 将 Blob 转换为 ArrayBuffer
          const arrayBuffer = await attachment.blob.arrayBuffer();
          attachmentsFolder.file(fileName, arrayBuffer);
        }
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
    if (editorHeightRatio !== null) settings[STORAGE_KEYS.EDITOR_HEIGHT_RATIO] = editorHeightRatio;
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

    const blob = await zip.generateAsync(zipGenOptions);
    saveAs(blob, `prompt-studio-backup-${Date.now()}.zip`);
  }

  /**
   * 根据 MIME 类型或原始文件名获取文件扩展名
   */
  private static getFileExtension(mimeType: string, originalFileName: string = ''): string {
    // 首先尝试从原始文件名中提取扩展名
    if (originalFileName && originalFileName.includes('.')) {
      const parts = originalFileName.split('.');
      const ext = parts[parts.length - 1].toLowerCase();
      if (ext.length >= 2 && ext.length <= 5) {
        return `.${ext}`;
      }
    }

    // 如果没有原始扩展名或扩展名不符合预期，则根据 MIME 类型推断
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/ogg': '.ogg',
      'video/quicktime': '.mov',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'text/html': '.html',
      'application/json': '.json',
    };

    return mimeToExt[mimeType] || '.bin';
  }

  /**
   * 导入 JSON 数据（使用新的导入服务）
   */
  async importFromJSON(
    file: File,
    options: ImportOptions,
    onProgress?: ImportProgressCallback
  ): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);

    // 使用新的导入服务，将 JSON 数据转换为 ZIP 格式
    const zip = new JSZip();

    if (data.project) {
      zip.file('projects.json', JSON.stringify([data.project], null, 2));
    }
    if (data.versions) {
      // 确保版本数据不包含 normalizedContent 字段
      const cleanVersions = data.versions.map(({ normalizedContent, ...version }: any) => version);
      zip.file('versions.json', JSON.stringify(cleanVersions, null, 2));
    }
    if (data.attachments) {
      zip.file('attachments.json', JSON.stringify(data.attachments, null, 2));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([blob], 'import.zip', { type: 'application/zip' });

    const result = await importService.importFromZip(zipFile, options, onProgress);
    if (!result.success) {
      throw new Error(result.message);
    }
  }
  /**
   * 导入 ZIP 备份（使用新的导入服务）
   */
  async importFromZip(
    file: File,
    options: ImportOptions,
    onProgress?: ImportProgressCallback
  ): Promise<void> {
    const result = await importService.importFromZip(file, options, onProgress);
    if (!result.success) {
      throw new Error(result.message);
    }
  }
}

export const exportService = new ExportService();
