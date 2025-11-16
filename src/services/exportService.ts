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

    const data = {
      project,
      versions,
      attachments,
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

    zip.file('projects.json', JSON.stringify(projects, null, 2));
    zip.file('folders.json', JSON.stringify(folders, null, 2));
    zip.file('versions.json', JSON.stringify(versions, null, 2));
    zip.file('snippets.json', JSON.stringify(snippets, null, 2));
    zip.file('attachments.json', JSON.stringify(attachments, null, 2));

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
   * 导入 JSON 数据
   */
  async importFromJSON(file: File): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.project) {
      await db.projects.put(data.project);
    }
    if (data.versions) {
      await db.versions.bulkPut(data.versions);
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
      const attachments = JSON.parse(await attachmentsFile.async('text'));
      await db.attachments.bulkPut(attachments);
    }
  }
}

export const exportService = new ExportService();
