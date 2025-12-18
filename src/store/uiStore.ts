import { create } from 'zustand';
import { layoutManager, type LayoutPreference } from '@/services/layoutManager';

interface UiState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarTemporarilyExpanded: boolean; // 新增：临时展开状态
  toggleSidebar: () => void;
  setTemporarilyExpanded: (temporarilyExpanded: boolean) => void; // 新增：设置临时展开状态

  // Folder Tree
  expandedFolders: string[];
  toggleFolder: (folderId: string) => void;
  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;

  // Canvas
  canvasScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasTransform: (scale: number, position: { x: number; y: number }) => void;
  resetCanvasTransform: () => void;

  // Layout Preference
  layoutPreference: LayoutPreference;
  isDraggingSplitter: boolean;
  setCanvasRatio: (ratio: number) => void;
  setEditorHeightRatio: (ratio: number) => void;
  startDragging: () => void;
  stopDragging: () => void;
  loadLayoutPreference: () => void;
  saveLayoutPreference: () => void;

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

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: layoutManager.loadPreference().sidebarCollapsed ?? false,
  sidebarTemporarilyExpanded: false, // 默认不是临时展开状态
  toggleSidebar: () => {
    set((state) => {
      const newCollapsed = !state.sidebarCollapsed;
      // 同步保存到 localStorage
      layoutManager.saveSidebarCollapsed(newCollapsed);
      return { sidebarCollapsed: newCollapsed };
    });
  },
  setTemporarilyExpanded: (temporarilyExpanded) => {
    set({ sidebarTemporarilyExpanded: temporarilyExpanded });
  },

  expandedFolders: [],
  toggleFolder: (folderId) =>
    set((state) => ({
      expandedFolders: state.expandedFolders.includes(folderId)
        ? state.expandedFolders.filter((id) => id !== folderId)
        : [...state.expandedFolders, folderId],
    })),
  expandFolder: (folderId) =>
    set((state) => ({
      expandedFolders: state.expandedFolders.includes(folderId)
        ? state.expandedFolders
        : [...state.expandedFolders, folderId],
    })),
  collapseFolder: (folderId) =>
    set((state) => ({
      expandedFolders: state.expandedFolders.filter((id) => id !== folderId),
    })),

  canvasScale: 1,
  canvasPosition: { x: 0, y: 0 },
  setCanvasTransform: (scale, position) => set({ canvasScale: scale, canvasPosition: position }),
  resetCanvasTransform: () => set({ canvasScale: 1, canvasPosition: { x: 0, y: 0 } }),

  layoutPreference: layoutManager.loadPreference(),
  isDraggingSplitter: false,

  setCanvasRatio: (ratio) => {
    set((state) => ({
      layoutPreference: {
        ...state.layoutPreference,
        canvasPanelWidthRatio: ratio,
      },
    }));
  },

  setEditorHeightRatio: (ratio) => {
    set((state) => ({
      layoutPreference: {
        ...state.layoutPreference,
        editorHeightRatio: ratio,
      },
    }));
  },

  startDragging: () => {
    set({ isDraggingSplitter: true });
  },

  stopDragging: () => {
    set({ isDraggingSplitter: false });
    get().saveLayoutPreference();
  },

  loadLayoutPreference: () => {
    const preference = layoutManager.loadPreference();
    set({
      layoutPreference: preference,
      sidebarCollapsed: preference.sidebarCollapsed ?? false,
    });
  },

  saveLayoutPreference: () => {
    const { layoutPreference, sidebarCollapsed } = get();
    layoutManager.saveCanvasRatio(layoutPreference.canvasPanelWidthRatio);
    layoutManager.saveEditorHeightRatio(layoutPreference.editorHeightRatio);
    layoutManager.saveSidebarCollapsed(sidebarCollapsed);
  },

  diffModalOpen: false,
  diffVersionIds: { a: null, b: null },
  openDiffModal: (versionA, versionB) =>
    set({
      diffModalOpen: true,
      diffVersionIds: { a: versionA, b: versionB },
    }),
  closeDiffModal: () => set({ diffModalOpen: false, diffVersionIds: { a: null, b: null } }),

  snippetLibraryOpen: false,
  toggleSnippetLibrary: () => set((state) => ({ snippetLibraryOpen: !state.snippetLibraryOpen })),

  loading: false,
  setLoading: (loading) => set({ loading }),
}));
