import { create } from 'zustand';
import { db } from '@/db/schema';
import type { Version } from '@/models/Version';
import { normalize } from '@/utils/normalize';
import { computeContentHash } from '@/utils/hash';

interface VersionState {
  // State
  versions: Version[];
  currentVersionId: string | null;

  // Actions
  loadVersions: (projectId: string) => Promise<void>;
  createVersion: (
    projectId: string,
    content: string,
    parentId: string | null,
    skipDuplicateCheck?: boolean
  ) => Promise<string>;
  updateVersionInPlace: (id: string, content: string) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  updateVersionScore: (id: string, score: number) => Promise<void>;
  setCurrentVersion: (id: string | null) => void;
  checkDuplicate: (content: string) => Promise<Version | null>;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  currentVersionId: null,
  compareState: {
    isOpen: false,
    sourceVersionId: null,
    targetVersionId: null,
  },

  loadVersions: async (projectId) => {
    const versions = await db.versions.where('projectId').equals(projectId).toArray();
    set({ versions });
  },

  createVersion: async (projectId, content, parentId, skipDuplicateCheck = false) => {
    const normalizedContent = normalize(content);
    const contentHash = computeContentHash(content);

    // 重复检测(除非明确跳过)
    if (!skipDuplicateCheck) {
      const duplicate = await get().checkDuplicate(content);
      if (duplicate) {
        throw new Error(`DUPLICATE_DETECTED:${duplicate.id}`);
      }
    }

    const version: Version = {
      id: crypto.randomUUID(),
      projectId,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content,
      normalizedContent,
      contentHash,
    };

    await db.transaction('rw', db.versions, db.projects, async () => {
      await db.versions.add(version);
      await db.projects.update(projectId, { updatedAt: Date.now() });
    });

    set((state) => ({
      versions: [...state.versions, version],
      currentVersionId: version.id,
    }));

    return version.id;
  },

  updateVersionInPlace: async (id, content) => {
    const version = await db.versions.get(id);
    if (!version) return;

    // User Story 4: 移除叶子节点限制,允许所有版本原地保存
    // const hasChildren = await db.versions.where('parentId').equals(id).count();
    // if (hasChildren > 0) {
    //   throw new Error('只能原地更新叶子节点');
    // }

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

    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === id
          ? { ...v, content, normalizedContent, contentHash, updatedAt: Date.now() }
          : v
      ),
    }));
  },

  deleteVersion: async (id) => {
    const version = await db.versions.get(id);
    if (!version) return;

    // 检查是否为根版本（parentId为null）
    if (!version.parentId) {
      // 获取项目下的所有根版本
      const rootVersions = await db.versions
        .where('projectId')
        .equals(version.projectId)
        .and((v) => v.parentId === null)
        .toArray();
      
      // 如果只有一个根版本，则不允许删除
      if (rootVersions.length <= 1) {
        throw new Error('每个项目必须至少保留一个根版本，不能删除唯一的根版本');
      }
    }

    await db.transaction('rw', db.versions, db.attachments, db.projects, async () => {
      // "接骨": 更新子版本的 parentId
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

    // 重新加载版本
    await get().loadVersions(version.projectId);

    set((state) => ({
      currentVersionId: state.currentVersionId === id ? null : state.currentVersionId,
    }));
  },

  updateVersionScore: async (id, score) => {
    await db.versions.update(id, { score });
    set((state) => ({
      versions: state.versions.map((v) => (v.id === id ? { ...v, score } : v)),
    }));
  },

  setCurrentVersion: (id) => {
    set({ currentVersionId: id });
  },

  checkDuplicate: async (content) => {
    const contentHash = computeContentHash(content);
    return (await db.versions.where('contentHash').equals(contentHash).first()) || null;
  },

  openCompare: (sourceVersionId) => {
    set({
      compareState: {
        isOpen: true,
        sourceVersionId,
        targetVersionId: null,
      },
    });
  },

  setCompareTarget: (targetVersionId) => {
    set((state) => ({
      compareState: {
        ...state.compareState,
        targetVersionId,
      },
    }));
  },

  closeCompare: () => {
    set({
      compareState: {
        isOpen: false,
        sourceVersionId: null,
        targetVersionId: null,
      },
    });
  },
}));
