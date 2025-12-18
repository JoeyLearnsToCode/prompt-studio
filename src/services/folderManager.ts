/**
 * 文件夹管理服务
 */

import { db } from '@/db/schema';
import type { Folder } from '@/models/Folder';
import { nanoid } from 'nanoid';

export class FolderManager {
  /**
   * 创建文件夹
   */
  async createFolder(name: string, parentId: string | null = null): Promise<string> {
    const folder: Folder = {
      id: nanoid(),
      name,
      parentId,
      createdAt: Date.now(),
    };

    await db.folders.add(folder);
    return folder.id;
  }

  /**
   * 更新文件夹
   */
  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    await db.folders.update(id, updates);
  }

  /**
   * 删除文件夹（级联删除）
   */
  async deleteFolder(id: string): Promise<void> {
    // 1. 获取所有子文件夹
    const children = await db.folders.where('parentId').equals(id).toArray();

    // 2. 递归删除子文件夹
    for (const child of children) {
      await this.deleteFolder(child.id);
    }

    // 3. 删除该文件夹中的项目
    const projects = await db.projects.where('folderId').equals(id).toArray();
    for (const project of projects) {
      // 删除项目的所有版本
      const versions = await db.versions.where('projectId').equals(project.id).toArray();
      for (const version of versions) {
        // 删除版本的附件
        await db.attachments.where('versionId').equals(version.id).delete();
      }
      await db.versions.where('projectId').equals(project.id).delete();
      await db.projects.delete(project.id);
    }

    // 4. 删除文件夹本身
    await db.folders.delete(id);
  }

  /**
   * 移动文件夹
   */
  async moveFolder(id: string, newParentId: string | null): Promise<void> {
    // 防止循环引用
    if (newParentId && (await this.isDescendant(newParentId, id))) {
      throw new Error('不能移动到自己的子文件夹中');
    }

    await db.folders.update(id, {
      parentId: newParentId,
      updatedAt: new Date(),
    });
  }

  /**
   * 检查是否是后代节点
   */
  private async isDescendant(folderId: string, ancestorId: string): Promise<boolean> {
    const folder = await db.folders.get(folderId);
    if (!folder) return false;
    if (folder.id === ancestorId) return true;
    if (!folder.parentId) return false;
    return this.isDescendant(folder.parentId, ancestorId);
  }

  /**
   * 获取所有文件夹
   */
  async getAllFolders(): Promise<Folder[]> {
    return await db.folders.toArray();
  }

  /**
   * 获取根文件夹
   */
  async getRootFolders(): Promise<Folder[]> {
    return await db.folders
      .where('parentId')
      .equals(null as any)
      .toArray();
  }

  /**
   * 获取子文件夹
   */
  async getChildFolders(parentId: string): Promise<Folder[]> {
    return await db.folders.where('parentId').equals(parentId).toArray();
  }

  /**
   * 重命名文件夹
   */
  async renameFolder(id: string, newName: string): Promise<void> {
    await db.folders.update(id, { name: newName });
  }
}

export const folderManager = new FolderManager();
