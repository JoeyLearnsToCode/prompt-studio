import { db } from '@/db/schema';
import type { Project } from '@/models/Project';

/**
 * 项目管理服务
 * 提供项目的 CRUD 操作
 */

export const projectManager = {
  /**
   * 获取所有项目
   */
  async getAllProjects(): Promise<Project[]> {
    return await db.projects.toArray();
  },

  /**
   * 获取文件夹下的项目
   */
  async getProjectsByFolder(folderId: string): Promise<Project[]> {
    return await db.projects.where('folderId').equals(folderId).toArray();
  },

  /**
   * 获取单个项目
   */
  async getProject(id: string): Promise<Project | undefined> {
    return await db.projects.get(id);
  },

  /**
   * 创建项目
   */
  async createProject(name: string, folderId: string): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      folderId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.projects.add(project);
    return project;
  },

  /**
   * 更新项目
   */
  async updateProject(
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  /**
   * 删除项目（级联删除所有版本和附件）
   */
  async deleteProject(id: string): Promise<void> {
    await db.transaction('rw', db.projects, db.versions, db.attachments, async () => {
      // 获取所有版本
      const versions = await db.versions.where('projectId').equals(id).toArray();
      const versionIds = versions.map((v) => v.id);

      // 删除所有附件
      if (versionIds.length > 0) {
        await db.attachments.where('versionId').anyOf(versionIds).delete();
      }

      // 删除所有版本
      await db.versions.where('projectId').equals(id).delete();

      // 删除项目
      await db.projects.delete(id);
    });
  },

  /**
   * 获取最近更新的项目
   */
  async getRecentProjects(limit: number = 10): Promise<Project[]> {
    return await db.projects.orderBy('updatedAt').reverse().limit(limit).toArray();
  },
};
