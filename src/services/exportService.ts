/**
 * 数据导入导出服务
 */

import { db } from '@/db/schema';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class ExportService {
/**
 * 导出单个项目为 JSON
 */
  async exportProjectAsJSON(projectId: string): Promise<void> {
    const project = await db.projects.get(projectId);
    const versions = await db.versions.where('projectId').equals(projectId).toArray();
    const attachments = await db.attachments.where('versionId').anyOf(versions.map(v => v.id)).toArray();

    // 清理版本数据，移除运行时计算的字段
    const cleanVersions = versions.map(({ normalizedContent, ...version }) => version);
    
    // 清理附件数据，移除 blob 字段（因为 JSON 无法序列化 Blob）
    const cleanAttachments = attachments.map(({ blob, isMissing, ...attachment }) => ({
      ...attachment,
      // 保留原始文件名和类型信息，但不包含实际二进制数据
      hasBlob: !!blob && !isMissing
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
      hasBlob: !!blob && !isMissing
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
          const fileExtension = ExportService.getFileExtension(attachment.fileType, attachment.fileName);
          const fileName = `${attachment.id}${fileExtension}`;
          
          // 将 Blob 转换为 ArrayBuffer
          const arrayBuffer = await attachment.blob.arrayBuffer();
          attachmentsFolder.file(fileName, arrayBuffer);
        }
      }
    }

    zip.file('metadata.json', JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0',
      counts: {
        projects: projects.length,
        folders: folders.length,
        versions: versions.length,
        snippets: snippets.length,
        attachments: attachments.length,
      },
    }, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
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
 * 导入 JSON 数据
 */
  async importFromJSON(file: File): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.project) {
      await db.projects.put(data.project);
    }
    if (data.versions) {
      // 确保版本数据不包含 normalizedContent 字段
      const cleanVersions = data.versions.map(({ normalizedContent, ...version }: any) => version);
      await db.versions.bulkPut(cleanVersions);
    }
    if (data.attachments) {
      await db.attachments.bulkPut(data.attachments);
    }
  }

/**
 * 导入 ZIP 备份
 */
  async importFromZip(file: File): Promise<void> {
    const zip = await JSZip.loadAsync(file);

    const projectsFile = zip.file('projects.json');
    const foldersFile = zip.file('folders.json');
    const versionsFile = zip.file('versions.json');
    const snippetsFile = zip.file('snippets.json');
    const attachmentsFile = zip.file('attachments.json');

    // 处理项目数据
    if (projectsFile) {
      const projects = JSON.parse(await projectsFile.async('text'));
      await db.projects.bulkPut(projects);
    }

    // 处理文件夹数据
    if (foldersFile) {
      const folders = JSON.parse(await foldersFile.async('text'));
      await db.folders.bulkPut(folders);
    }

    // 处理版本数据
    if (versionsFile) {
      const versions = JSON.parse(await versionsFile.async('text'));
      const cleanVersions = versions.map(({ normalizedContent, ...version }: any) => version);
      await db.versions.bulkPut(cleanVersions);
    }

    // 处理代码片段数据
    if (snippetsFile) {
      const snippets = JSON.parse(await snippetsFile.async('text'));
      await db.snippets.bulkPut(snippets);
    }

    // 处理附件数据和文件
    if (attachmentsFile) {
      const attachments = JSON.parse(await attachmentsFile.async('text'));
      const attachmentsFolder = zip.folder('attachments');
      
      // 为每个附件处理文件数据
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
            const fileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', 
                                   '.mp4', '.webm', '.mov', '.pdf', '.txt', '.html', '.json', '.bin'];
            
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
      
      await db.attachments.bulkPut(processedAttachments);
    }
  }
}

export const exportService = new ExportService();
