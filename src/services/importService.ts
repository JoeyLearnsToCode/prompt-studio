/**
 * 统一的导入服务
 * 支持从 WebDAV 和 ZIP 文件导入，提供合并和覆盖两种模式
 */

import { db } from '@/db/schema';
import JSZip from 'jszip';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { normalize } from '@/utils/normalize';
import type {
  ImportOptions,
  ImportResult,
  ImportProgress,
  ImportProgressCallback,
} from '@/types/import';

/**
 * 统一的导入服务
 */
export class ImportService {
  /**
   * 从 ZIP 文件导入数据
   */
  async importFromZip(
    file: File,
    options: ImportOptions,
    onProgress?: ImportProgressCallback
  ): Promise<ImportResult> {
    const zip = await JSZip.loadAsync(file);

    // 读取所有数据文件
    const projectsFile = zip.file('projects.json');
    const foldersFile = zip.file('folders.json');
    const versionsFile = zip.file('versions.json');
    const snippetsFile = zip.file('snippets.json');
    const attachmentsFile = zip.file('attachments.json');
    const settingsFile = zip.file('settings.json');

    // 计算总进度
    const totalStages = 6; // projects, folders, versions, snippets, attachments, settings
    let currentStage = 0;

    const updateProgress = (
      _stageValue: ImportResult['imported'][keyof ImportResult['imported']],
      stageName: ImportProgress['stage'],
      message: string
    ) => {
      currentStage++;
      onProgress?.({
        current: currentStage,
        total: totalStages,
        stage: stageName,
        message: `${message} (${currentStage}/${totalStages})`,
      });
    };

    // 根据模式决定是否清空现有数据
    if (options.mode === 'overwrite') {
      await this.clearAllData();
      updateProgress(0, 'projects', '正在清空现有数据');
    }

    const imported = {
      projects: 0,
      folders: 0,
      versions: 0,
      snippets: 0,
      attachments: 0,
    };

    try {
      // 导入项目数据
      if (projectsFile) {
        const projects = JSON.parse(await projectsFile.async('text'));
        const result = await this.importProjects(projects, options.mode);
        imported.projects = result;
        updateProgress(result, 'projects', `正在导入项目 (${result} 个)`);
      }

      // 导入文件夹数据
      if (foldersFile) {
        const folders = JSON.parse(await foldersFile.async('text'));
        const result = await this.importFolders(folders, options.mode);
        imported.folders = result;
        updateProgress(result, 'folders', `正在导入文件夹 (${result} 个)`);
      }

      // 导入版本数据
      if (versionsFile) {
        const versions = JSON.parse(await versionsFile.async('text'));
        const result = await this.importVersions(versions, options.mode);
        imported.versions = result;
        updateProgress(result, 'versions', `正在导入版本 (${result} 个)`);
      }

      // 导入代码片段数据
      if (snippetsFile) {
        const snippets = JSON.parse(await snippetsFile.async('text'));
        const result = await this.importSnippets(snippets, options.mode);
        imported.snippets = result;
        updateProgress(result, 'snippets', `正在导入代码片段 (${result} 个)`);
      }

      // 导入附件数据和文件
      if (attachmentsFile) {
        const result = await this.importAttachments(attachmentsFile, zip, options.mode);
        imported.attachments = result;
        updateProgress(result, 'attachments', `正在导入附件 (${result} 个)`);
      }

      // 导入设置数据
      if (settingsFile) {
        await this.importSettings(settingsFile);
        updateProgress(0, 'settings', '正在导入设置');
      }

      return {
        success: true,
        message: `导入成功！项目：${imported.projects}，文件夹：${imported.folders}，版本：${imported.versions}，代码片段：${imported.snippets}，附件：${imported.attachments}`,
        imported,
      };
    } catch (error) {
      console.error('导入失败:', error);
      return {
        success: false,
        message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
        imported,
      };
    }
  }

  /**
   * 从 WebDAV 导入数据
   */
  async importFromWebDAV(
    webdavService: any,
    remotePath: string,
    options: ImportOptions,
    onProgress?: ImportProgressCallback
  ): Promise<ImportResult> {
    try {
      // 从 WebDAV 下载文件
      const arrayBuffer = (await webdavService.client.getFileContents(remotePath, {
        format: 'binary',
      })) as ArrayBuffer;

      // 转换为 File 对象以便复用 ZIP 导入逻辑
      const file = new File([arrayBuffer], 'backup.zip', { type: 'application/zip' });

      // 复用 ZIP 导入逻辑
      return await this.importFromZip(file, options, onProgress);
    } catch (error) {
      console.error('WebDAV 导入失败:', error);
      return {
        success: false,
        message: `WebDAV 导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
        imported: {
          projects: 0,
          folders: 0,
          versions: 0,
          snippets: 0,
          attachments: 0,
        },
      };
    }
  }

  /**
   * 清空所有数据
   */
  private async clearAllData(): Promise<void> {
    await db.transaction(
      'rw',
      db.projects,
      db.folders,
      db.versions,
      db.snippets,
      db.attachments,
      async () => {
        await db.projects.clear();
        await db.folders.clear();
        await db.versions.clear();
        await db.snippets.clear();
        await db.attachments.clear();
      }
    );
  }

  /**
   * 导入项目数据
   */
  private async importProjects(projects: any[], mode: 'merge' | 'overwrite'): Promise<number> {
    if (mode === 'merge') {
      // 合并模式：根据 UUID 判断是否已存在
      const existingIds = new Set(await db.projects.toCollection().primaryKeys());
      const newProjects = projects.filter((project) => !existingIds.has(project.id));
      if (newProjects.length > 0) {
        await db.projects.bulkPut(newProjects);
      }
      return newProjects.length;
    } else {
      // 覆盖模式：直接批量插入
      await db.projects.bulkPut(projects);
      return projects.length;
    }
  }

  /**
   * 导入文件夹数据
   */
  private async importFolders(folders: any[], mode: 'merge' | 'overwrite'): Promise<number> {
    if (mode === 'merge') {
      const existingIds = new Set(await db.folders.toCollection().primaryKeys());
      const newFolders = folders.filter((folder) => !existingIds.has(folder.id));
      if (newFolders.length > 0) {
        await db.folders.bulkPut(newFolders);
      }
      return newFolders.length;
    } else {
      await db.folders.bulkPut(folders);
      return folders.length;
    }
  }

  /**
   * 导入版本数据
   */
  private async importVersions(versions: any[], mode: 'merge' | 'overwrite'): Promise<number> {
    if (mode === 'merge') {
      // 合并的粒度是版本
      const existingIds = new Set(await db.versions.toCollection().primaryKeys());
      const newVersions = versions.filter((version) => !existingIds.has(version.id));

      if (newVersions.length > 0) {
        // 清理版本数据，移除运行时计算的字段，并添加 normalizedContent
        const cleanVersions = newVersions.map(({ normalizedContent, ...version }) => ({
          ...version,
          normalizedContent: normalize(version.content),
        }));
        await db.versions.bulkPut(cleanVersions);
      }
      return newVersions.length;
    } else {
      // 覆盖模式：清理版本数据，移除运行时计算的字段，并添加 normalizedContent
      const cleanVersions = versions.map(({ normalizedContent, ...version }) => ({
        ...version,
        normalizedContent: normalize(version.content),
      }));
      await db.versions.bulkPut(cleanVersions);
      return versions.length;
    }
  }

  /**
   * 导入代码片段数据
   */
  private async importSnippets(snippets: any[], mode: 'merge' | 'overwrite'): Promise<number> {
    if (mode === 'merge') {
      const existingIds = new Set(await db.snippets.toCollection().primaryKeys());
      const newSnippets = snippets.filter((snippet) => !existingIds.has(snippet.id));
      if (newSnippets.length > 0) {
        await db.snippets.bulkPut(newSnippets);
      }
      return newSnippets.length;
    } else {
      await db.snippets.bulkPut(snippets);
      return snippets.length;
    }
  }

  /**
   * 导入附件数据和文件
   */
  private async importAttachments(
    attachmentsFile: JSZip.JSZipObject,
    zip: JSZip,
    mode: 'merge' | 'overwrite'
  ): Promise<number> {
    const attachments = JSON.parse(await attachmentsFile.async('text'));
    const attachmentsFolder = zip.folder('attachments');

    // 根据模式决定是否清空现有附件
    if (mode === 'overwrite') {
      await db.attachments.clear();
    }

    // 处理附件数据和文件
    const processedAttachments = await Promise.all(
      attachments.map(async (attachment: any) => {
        // 初始化附件对象
        const processedAttachment: any = {
          ...attachment,
          isMissing: true, // 默认标记为缺失，直到找到文件
        };

        // 尝试从附件文件夹中查找对应的文件
        if (attachmentsFolder) {
          // 查找可能的文件名（根据附件ID和扩展名）
          const fileExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp',
            '.svg',
            '.mp4',
            '.webm',
            '.mov',
            '.pdf',
            '.txt',
            '.html',
            '.json',
            '.bin',
          ];

          for (const ext of fileExtensions) {
            const fileName = `${attachment.id}${ext}`;
            const file = attachmentsFolder.file(fileName);

            if (file) {
              try {
                // 获取文件内容并创建 Blob
                const arrayBuffer = await file.async('arraybuffer');
                processedAttachment.blob = new Blob([arrayBuffer], { type: attachment.fileType });
                processedAttachment.isMissing = false; // 找到文件，标记为未缺失
                break; // 找到文件后停止搜索
              } catch (error) {
                console.warn(`Failed to load attachment file: ${fileName}`, error);
              }
            }
          }
        }

        return processedAttachment;
      })
    );

    // 根据模式决定如何保存附件
    if (mode === 'merge') {
      // 合并模式：只添加不存在的附件
      const existingIds = new Set(await db.attachments.toCollection().primaryKeys());
      const newAttachments = processedAttachments.filter((att) => !existingIds.has(att.id));
      if (newAttachments.length > 0) {
        await db.attachments.bulkPut(newAttachments);
      }
      return newAttachments.length;
    } else {
      // 覆盖模式：直接批量插入
      await db.attachments.bulkPut(processedAttachments);
      return processedAttachments.length;
    }
  }

  /**
   * 导入设置数据
   */
  private async importSettings(settingsFile: JSZip.JSZipObject): Promise<void> {
    const settings = JSON.parse(await settingsFile.async('text'));

    // 恢复 WebDAV 配置（除了当前使用的配置）
    if (settings[STORAGE_KEYS.WEBDAV_CONFIG]) {
      // 保留当前 WebDAV 配置，不覆盖
      // storage.set(STORAGE_KEYS.WEBDAV_CONFIG, settings[STORAGE_KEYS.WEBDAV_CONFIG]);
    }

    // 恢复布局设置
    if (settings[STORAGE_KEYS.CANVAS_RATIO] !== undefined) {
      storage.set(STORAGE_KEYS.CANVAS_RATIO, settings[STORAGE_KEYS.CANVAS_RATIO]);
    }
    if (settings[STORAGE_KEYS.EDITOR_HEIGHT_RATIO] !== undefined) {
      storage.set(STORAGE_KEYS.EDITOR_HEIGHT_RATIO, settings[STORAGE_KEYS.EDITOR_HEIGHT_RATIO]);
    }
    if (settings[STORAGE_KEYS.SIDEBAR_COLLAPSED] !== undefined) {
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, settings[STORAGE_KEYS.SIDEBAR_COLLAPSED]);
    }
  }
}

export const importService = new ImportService();
