# 状态管理契约 (Zustand Stores)

**Purpose**: 定义 Zustand store 的结构、actions 和数据流

## Store 架构

Prompt Studio 使用多个独立的 Zustand store，每个负责一个领域：

1. **projectStore**: 项目和文件夹管理
2. **versionStore**: 版本数据和操作
3. **uiStore**: UI 状态（画布缩放、侧边栏展开等）
4. **settingsStore**: 用户设置（WebDAV 配置、主题等）

---

## 1. projectStore

**职责**: 管理文件夹和项目数据

```typescript
import create from 'zustand';
import { db } from '../db/schema';

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
  setCurrentProject: (id: string | null) => void;
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
    set(state => ({ folders: [...state.folders, folder] }));
    return folder.id;
  },
  
  renameFolder: async (id, newName) => {
    await db.folders.update(id, { name: newName });
    set(state => ({
      folders: state.folders.map(f => f.id === id ? { ...f, name: newName } : f),
    }));
  },
  
  deleteFolder: async (id) => {
    // 获取子文件夹和项目
    const folder = await db.folders.get(id);
    if (!folder) return;
    
    const children = await db.folders.where('parentId').equals(id).toArray();
    const projects = await db.projects.where('folderId').equals(id).toArray();
    
    // 移动子文件夹和项目到父文件夹
    await db.transaction('rw', db.folders, db.projects, async () => {
      for (const child of children) {
        await db.folders.update(child.id, { parentId: folder.parentId });
      }
      for (const project of projects) {
        await db.projects.update(project.id, { folderId: folder.parentId || 'root' });
      }
      await db.folders.delete(id);
    });
    
    // 更新状态
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
    
    await db.projects.add(project);
    set(state => ({ projects: [...state.projects, project] }));
    return project.id;
  },
  
  renameProject: async (id, newName) => {
    await db.projects.update(id, { name: newName, updatedAt: Date.now() });
    set(state => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p
      ),
    }));
  },
  
  updateProjectTags: async (id, tags) => {
    await db.projects.update(id, { tags, updatedAt: Date.now() });
    set(state => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, tags, updatedAt: Date.now() } : p
      ),
    }));
  },
  
  deleteProject: async (id) => {
    await db.transaction('rw', db.projects, db.versions, db.attachments, async () => {
      const versions = await db.versions.where('projectId').equals(id).toArray();
      const versionIds = versions.map(v => v.id);
      
      await db.attachments.where('versionId').anyOf(versionIds).delete();
      await db.versions.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });
    
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    }));
  },
  
  setCurrentProject: (id) => {
    set({ currentProjectId: id });
  },
}));
```

---

## 2. versionStore

**职责**: 管理版本数据和核心操作

```typescript
import create from 'zustand';
import { db } from '../db/schema';
import { normalize, computeContentHash } from '../utils';

interface VersionState {
  // State
  versions: Version[];
  currentVersionId: string | null;
  
  // Actions
  loadVersions: (projectId: string) => Promise<void>;
  createVersion: (projectId: string, content: string, parentId: string | null) => Promise<string>;
  updateVersionInPlace: (id: string, content: string) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  updateVersionScore: (id: string, score: number) => Promise<void>;
  setCurrentVersion: (id: string | null) => void;
  checkDuplicate: (content: string) => Promise<Version | null>;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  currentVersionId: null,
  
  loadVersions: async (projectId) => {
    const versions = await db.versions.where('projectId').equals(projectId).toArray();
    set({ versions });
  },
  
  createVersion: async (projectId, content, parentId) => {
    const normalizedContent = normalize(content);
    const contentHash = computeContentHash(content);
    
    // 重复检测
    const duplicate = await get().checkDuplicate(content);
    if (duplicate) {
      // 可选：显示警告 UI
      console.warn(`检测到重复版本: ${duplicate.id}`);
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
      // 更新项目的 updatedAt
      await db.projects.update(projectId, { updatedAt: Date.now() });
    });
    
    set(state => ({ 
      versions: [...state.versions, version],
      currentVersionId: version.id,
    }));
    
    return version.id;
  },
  
  updateVersionInPlace: async (id, content) => {
    const version = await db.versions.get(id);
    if (!version) return;
    
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
    
    set(state => ({
      versions: state.versions.map(v =>
        v.id === id
          ? { ...v, content, normalizedContent, contentHash, updatedAt: Date.now() }
          : v
      ),
    }));
  },
  
  deleteVersion: async (id) => {
    const version = await db.versions.get(id);
    if (!version) return;
    
    await db.transaction('rw', db.versions, db.attachments, db.projects, async () => {
      // "接骨"：更新子版本的 parentId
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
    
    // 重新加载版本（简化状态更新）
    await get().loadVersions(version.projectId);
    
    set(state => ({
      currentVersionId: state.currentVersionId === id ? null : state.currentVersionId,
    }));
  },
  
  updateVersionScore: async (id, score) => {
    await db.versions.update(id, { score });
    set(state => ({
      versions: state.versions.map(v => v.id === id ? { ...v, score } : v),
    }));
  },
  
  setCurrentVersion: (id) => {
    set({ currentVersionId: id });
  },
  
  checkDuplicate: async (content) => {
    const contentHash = computeContentHash(content);
    return await db.versions.where('contentHash').equals(contentHash).first() || null;
  },
}));
```

---

## 3. uiStore

**职责**: 管理 UI 状态（非持久化）

```typescript
import create from 'zustand';

interface UiState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Canvas
  canvasScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasTransform: (scale: number, position: { x: number; y: number }) => void;
  resetCanvasTransform: () => void;
  
  // Modals
  diffModalOpen: boolean;
  diffVersionIds: { a: string | null; b: string | null };
  openDiffModal: (versionA: string, versionB: string) => void;
  closeDiffModal: () => void;
  
  snippetLibraryOpen: boolean;
  toggleSnippetLibrary: () => void;
  
  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  canvasScale: 1,
  canvasPosition: { x: 0, y: 0 },
  setCanvasTransform: (scale, position) => set({ canvasScale: scale, canvasPosition: position }),
  resetCanvasTransform: () => set({ canvasScale: 1, canvasPosition: { x: 0, y: 0 } }),
  
  diffModalOpen: false,
  diffVersionIds: { a: null, b: null },
  openDiffModal: (versionA, versionB) => set({ 
    diffModalOpen: true, 
    diffVersionIds: { a: versionA, b: versionB } 
  }),
  closeDiffModal: () => set({ diffModalOpen: false, diffVersionIds: { a: null, b: null } }),
  
  snippetLibraryOpen: false,
  toggleSnippetLibrary: () => set(state => ({ snippetLibraryOpen: !state.snippetLibraryOpen })),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
```

---

## 4. settingsStore

**职责**: 管理用户设置（持久化到 localStorage）

```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // WebDAV
  webdavUrl: string;
  webdavUsername: string;
  webdavPassword: string;
  setWebdavConfig: (url: string, username: string, password: string) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  // Editor
  editorFontSize: number;
  editorLineHeight: number;
  setEditorSettings: (fontSize: number, lineHeight: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      webdavUrl: '',
      webdavUsername: '',
      webdavPassword: '',
      setWebdavConfig: (url, username, password) => set({ webdavUrl: url, webdavUsername: username, webdavPassword: password }),
      
      theme: 'auto',
      setTheme: (theme) => set({ theme }),
      
      editorFontSize: 14,
      editorLineHeight: 1.5,
      setEditorSettings: (fontSize, lineHeight) => set({ editorFontSize: fontSize, editorLineHeight: lineHeight }),
    }),
    {
      name: 'prompt-studio-settings', // localStorage key
    }
  )
);
```

---

## 数据流图

```
用户操作
    ↓
React 组件
    ↓
Zustand Store Action
    ↓
IndexedDB (Dexie.js) ← 数据持久化
    ↓
Zustand Store State 更新
    ↓
React 组件重新渲染
```

### 示例：创建新版本的数据流

1. **用户**: 在编辑器中输入文本，按 `Ctrl+Enter`
2. **组件**: `PromptEditor.tsx` 调用 `useVersionStore().createVersion(projectId, content, parentId)`
3. **Store**: `versionStore.createVersion()`
   - 调用 `normalize()` 和 `computeContentHash()`
   - 检查重复（查询 IndexedDB）
   - 创建 `Version` 对象
   - 写入 IndexedDB（事务）
   - 更新 `versions` 状态数组
4. **组件**: 订阅了 `versions` 的组件自动重新渲染
5. **画布**: `VersionCanvas.tsx` 检测到新版本，重新计算树形布局并渲染

---

## Store 使用最佳实践

### 1. 选择性订阅

```typescript
// ❌ 低效：订阅整个 store（任何状态变化都会重新渲染）
function MyComponent() {
  const projectStore = useProjectStore();
  // ...
}

// ✅ 高效：仅订阅需要的状态
function MyComponent() {
  const currentProjectId = useProjectStore(state => state.currentProjectId);
  const setCurrentProject = useProjectStore(state => state.setCurrentProject);
  // ...
}
```

### 2. 批量状态更新

```typescript
// ❌ 低效：多次 set 调用
set({ folders: newFolders });
set({ projects: newProjects });

// ✅ 高效：单次 set 调用
set({ folders: newFolders, projects: newProjects });
```

### 3. 异步 action 错误处理

```typescript
createProject: async (name, folderId) => {
  try {
    const project = { /* ... */ };
    await db.projects.add(project);
    set(state => ({ projects: [...state.projects, project] }));
    return project.id;
  } catch (error) {
    console.error('创建项目失败:', error);
    // 可选：使用 uiStore 显示错误通知
    useUiStore.getState().showError('创建项目失败');
    throw error;  // 重新抛出让调用者处理
  }
}
```

---

## 契约保证

1. **状态一致性**: 所有 IndexedDB 操作成功后才更新 Zustand 状态
2. **事务原子性**: 涉及多表操作使用 Dexie 事务
3. **类型安全**: 所有 store 使用 TypeScript 严格类型定义
4. **持久化**: `settingsStore` 使用 `zustand/middleware/persist` 持久化到 localStorage
5. **错误处理**: 所有异步 action 包含 try-catch 错误处理

**契约版本**: 1.0  
**最后更新**: 2025-11-16
