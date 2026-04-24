import { create } from 'zustand';
import Fuse from 'fuse.js';
import type { Version } from '@/models/Version';

export interface VersionSearchState {
  query: string;
  matches: string[];
  currentIndex: number;
  total: number;
  isActive: boolean;
}

interface VersionSearchStore extends VersionSearchState {
  setQuery: (query: string) => void;
  executeSearch: (versions: Version[], query: string) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  clearSearch: () => void;
  focusMatch: (index: number) => void;
}

const initialState: VersionSearchState = {
  query: '',
  matches: [],
  currentIndex: -1,
  total: 0,
  isActive: false,
};

export const useVersionSearchStore = create<VersionSearchStore>((set) => ({
  ...initialState,

  setQuery: (query) => {
    set({ query });
  },

  executeSearch: (versions, query) => {
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

    const results = fuse.search(query);
    const matches = results.map((r) => r.item.id);

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
