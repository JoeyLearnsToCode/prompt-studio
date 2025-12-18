import { create } from 'zustand';
import { db } from '@/db/schema';
import type { Folder } from '@/models/Folder';
import type { Project } from '@/models/Project';

interface ProjectState {
  // State
  folders: Folder[];
  projects: Project[];
  currentProjectId: string | null;

  // Actions
  loadFolders: () => Promise<void>;
  loadProjects: (folderId?: string) => Promise<void>;
  createFolder: (name: string, parentId: string | null) => Promise<string>;
  renameFolder: (id: string, newName: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  createProject: (name: string, folderId: string) => Promise<string>;
  renameProject: (id: string, newName: string) => Promise<void>;
  updateProjectTags: (id: string, tags: Project['tags']) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  moveProject: (projectId: string, folderId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  folders: [],
  projects: [],
  currentProjectId: null,

  loadFolders: async () => {
    const folders = await db.folders.toArray();
    set({ folders });
  },

  loadProjects: async (folderId?: string) => {
    const query = folderId
      ? db.projects.where('folderId').equals(folderId)
      : db.projects.toCollection();
    const projects = await query.toArray();
    set({ projects });
  },

  createFolder: async (name, parentId) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: Date.now(),
    };
    await db.folders.add(folder);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder.id;
  },

  renameFolder: async (id, newName) => {
    await db.folders.update(id, { name: newName });
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, name: newName } : f)),
    }));
  },

  deleteFolder: async (id) => {
    const folder = await db.folders.get(id);
    if (!folder) return;

    const children = await db.folders.where('parentId').equals(id).toArray();
    const projects = await db.projects.where('folderId').equals(id).toArray();

    await db.transaction('rw', db.folders, db.projects, async () => {
      for (const child of children) {
        await db.folders.update(child.id, { parentId: folder.parentId });
      }
      for (const project of projects) {
        await db.projects.update(project.id, {
          folderId: folder.parentId || 'root',
        });
      }
      await db.folders.delete(id);
    });

    await get().loadFolders();
    await get().loadProjects();
  },

  createProject: async (name, folderId) => {
    const project: Project = {
      id: crypto.randomUUID(),
      folderId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.transaction('rw', db.projects, db.versions, async () => {
      await db.projects.add(project);

      // 创建初始根版本
      const rootVersion = {
        id: crypto.randomUUID(),
        projectId: project.id,
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content: '',
        contentHash: '',
      };
      await db.versions.add(rootVersion);
    });

    set((state) => ({ projects: [...state.projects, project] }));
    return project.id;
  },

  renameProject: async (id, newName) => {
    await db.projects.update(id, { name: newName, updatedAt: Date.now() });
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p
      ),
    }));
  },

  updateProjectTags: async (id, tags) => {
    await db.projects.update(id, { tags, updatedAt: Date.now() });
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, tags, updatedAt: Date.now() } : p
      ),
    }));
  },

  deleteProject: async (id) => {
    await db.transaction('rw', db.projects, db.versions, db.attachments, async () => {
      const versions = await db.versions.where('projectId').equals(id).toArray();
      const versionIds = versions.map((v) => v.id);

      await db.attachments.where('versionId').anyOf(versionIds).delete();
      await db.versions.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });

    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    }));
  },

  selectProject: (id) => {
    set({ currentProjectId: id });
  },

  setCurrentProject: (id) => {
    set({ currentProjectId: id });
  },

  moveProject: async (projectId, folderId) => {
    // 如果folderId是'root'，转换为null
    const dbFolderId = folderId === 'root' ? null : folderId;
    await db.projects.update(projectId, { folderId: dbFolderId, updatedAt: Date.now() });
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, folderId: dbFolderId, updatedAt: Date.now() } : p
      ),
    }));
  },
}));
