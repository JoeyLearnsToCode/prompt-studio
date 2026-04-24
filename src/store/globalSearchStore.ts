import { create } from 'zustand';
import Fuse from 'fuse.js';
import type { Project } from '@/models/Project';
import type { Version } from '@/models/Version';

export interface GlobalSearchState {
  query: string;
  matches: string[];
  currentIndex: number;
  total: number;
  isActive: boolean;
}

interface GlobalSearchStore extends GlobalSearchState {
  setQuery: (query: string) => void;
  executeSearch: (projects: Project[], versions: Version[], query: string) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  clearSearch: () => void;
  focusMatch: (index: number) => void;
}

const initialState: GlobalSearchState = {
  query: '',
  matches: [],
  currentIndex: -1,
  total: 0,
  isActive: false,
};

export const useGlobalSearchStore = create<GlobalSearchStore>((set) => ({
  ...initialState,

  setQuery: (query) => {
    set({ query });
  },

  executeSearch: (projects, versions, query) => {
    if (!query.trim()) {
      set(initialState);
      return;
    }

    const fuse = new Fuse(versions, {
      keys: ['name', 'content'],
      threshold: 0.4,
      ignoreLocation: true,
      shouldSort: true,
    });

    const versionHits = new Set<string>();
    for (const r of fuse.search(query)) {
      versionHits.add(r.item.projectId);
    }

    const projectFuse = new Fuse(projects, {
      keys: ['name'],
      threshold: 0.4,
      ignoreLocation: true,
      shouldSort: true,
    });

    const matchedProjectIds = new Set<string>();
    for (const r of projectFuse.search(query)) {
      matchedProjectIds.add(r.item.id);
    }

    const allMatchedProjectIds = new Set([...matchedProjectIds, ...versionHits]);

    const matchedProjects = projects.filter((p) => allMatchedProjectIds.has(p.id));
    const matches = matchedProjects.map((p) => p.id);

    set({
      query,
      matches,
      total: matches.length,
      currentIndex: matches.length > 0 ? 0 : -1,
      isActive: true,
    });
  },

  nextMatch: () => {
    set((state) => {
      if (state.matches.length === 0) return state;
      return { currentIndex: (state.currentIndex + 1) % state.matches.length };
    });
  },

  prevMatch: () => {
    set((state) => {
      if (state.matches.length === 0) return state;
      return {
        currentIndex: (state.currentIndex - 1 + state.matches.length) % state.matches.length,
      };
    });
  },

  clearSearch: () => {
    set(initialState);
  },

  focusMatch: (index) => {
    set((state) => {
      if (index < 0 || index >= state.matches.length) return state;
      return { currentIndex: index };
    });
  },
}));
