import { db } from '@/db/schema';
import type { Version } from '@/models/Version';
import { normalize } from '@/utils/normalize';
import { computeContentHash } from '@/utils/hash';

/**
 * 版本管理服务
 * 提供版本的创建、更新、删除等操作
 */

export const versionManager = {
  /**
   * 获取项目的所有版本
   */
  async getVersionsByProject(projectId: string): Promise<Version[]> {
    return await db.versions.where('projectId').equals(projectId).toArray();
  },

  /**
   * 获取单个版本
   */
  async getVersion(id: string): Promise<Version | undefined> {
    return await db.versions.get(id);
  },

  /**
   * 创建新版本
   */
  async createVersion(
    projectId: string,
    content: string,
    parentId: string | null,
    score?: number
  ): Promise<Version> {
    const normalizedContent = normalize(content);
    const contentHash = computeContentHash(content);

    const version: Version = {
      id: crypto.randomUUID(),
      projectId,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content,
      normalizedContent,
      contentHash,
      score,
    };

    await db.transaction('rw', db.versions, db.projects, async () => {
      await db.versions.add(version);
      // 更新项目的 updatedAt
      await db.projects.update(projectId, { updatedAt: Date.now() });
    });

    return version;
  },

  /**
   * 原地更新版本（仅叶子节点）
   */
  async updateVersionInPlace(id: string, content: string): Promise<void> {
    const version = await db.versions.get(id);
    if (!version) {
      throw new Error('版本不存在');
    }

    // 检查是否为叶子节点
    const hasChildren = await db.versions.where('parentId').equals(id).count();
    if (hasChildren > 0) {
      throw new Error('只能原地更新叶子节点');
    }

    const normalizedContent = normalize(content);
    const contentHash = computeContentHash(content);

    await db.transaction('rw', db.versions, db.projects, async () => {
      await db.versions.update(id, {
        content,
        normalizedContent,
        contentHash,
        updatedAt: Date.now(),
      });
      await db.projects.update(version.projectId, { updatedAt: Date.now() });
    });
  },

  /**
   * 删除版本（执行接骨逻辑）
   */
  async deleteVersion(id: string): Promise<void> {
    const version = await db.versions.get(id);
    if (!version) {
      throw new Error('版本不存在');
    }

    await db.transaction('rw', db.versions, db.attachments, db.projects, async () => {
      // 接骨: 更新子版本的 parentId
      const children = await db.versions.where('parentId').equals(id).toArray();
      for (const child of children) {
        await db.versions.update(child.id, { parentId: version.parentId });
      }

      // 删除附件
      await db.attachments.where('versionId').equals(id).delete();

      // 删除版本
      await db.versions.delete(id);

      // 更新项目的 updatedAt
      await db.projects.update(version.projectId, { updatedAt: Date.now() });
    });
  },

  /**
   * 更新版本评分
   */
  async updateVersionScore(id: string, score: number): Promise<void> {
    await db.versions.update(id, { score });
  },

  /**
   * 检查重复内容
   */
  async checkDuplicate(content: string, projectId?: string): Promise<Version | null> {
    const contentHash = computeContentHash(content);
    const query = db.versions.where('contentHash').equals(contentHash);
    
    if (projectId) {
      return (await query.and(v => v.projectId === projectId).first()) || null;
    }
    
    return (await query.first()) || null;
  },

  /**
   * 获取版本的子版本
   */
  async getChildren(versionId: string): Promise<Version[]> {
    return await db.versions.where('parentId').equals(versionId).toArray();
  },

  /**
   * 检查是否为叶子节点
   */
  async isLeafNode(versionId: string): Promise<boolean> {
    const childrenCount = await db.versions.where('parentId').equals(versionId).count();
    return childrenCount === 0;
  },

  /**
   * 获取项目中最新更新的版本
   */
  async getLatestVersion(projectId: string): Promise<Version | null> {
    const versions = await db.versions
      .where('projectId')
      .equals(projectId)
      .toArray();
    
    if (versions.length === 0) return null;
    
    return versions.reduce((latest, current) =>
      current.updatedAt > latest.updatedAt ? current : latest
    );
  },
};
