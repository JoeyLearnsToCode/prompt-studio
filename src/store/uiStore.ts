import { create } from 'zustand';

interface UiState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

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
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

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
  setCanvasTransform: (scale, position) =>
    set({ canvasScale: scale, canvasPosition: position }),
  resetCanvasTransform: () => set({ canvasScale: 1, canvasPosition: { x: 0, y: 0 } }),

  diffModalOpen: false,
  diffVersionIds: { a: null, b: null },
  openDiffModal: (versionA, versionB) =>
    set({
      diffModalOpen: true,
      diffVersionIds: { a: versionA, b: versionB },
    }),
  closeDiffModal: () =>
    set({ diffModalOpen: false, diffVersionIds: { a: null, b: null } }),

  snippetLibraryOpen: false,
  toggleSnippetLibrary: () =>
    set((state) => ({ snippetLibraryOpen: !state.snippetLibraryOpen })),

  loading: false,
  setLoading: (loading) => set({ loading }),
}));
