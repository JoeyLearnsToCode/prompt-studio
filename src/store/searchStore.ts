import { create } from 'zustand';
import type { Version } from '@/models/Version';

export interface SearchState {
  query: string; // 搜索关键词
  matches: string[]; // 匹配的版本ID列表
  currentIndex: number; // 当前聚焦的匹配结果索引(0-based)
  total: number; // 匹配总数
  isActive: boolean; // 搜索是否激活
}

interface SearchStore extends SearchState {
  // Actions
  setQuery: (query: string) => void;
  executeSearch: (versions: Version[], query: string) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  clearSearch: () => void;
  focusMatch: (index: number) => void;
}

const initialState: SearchState = {
  query: '',
  matches: [],
  currentIndex: -1,
  total: 0,
  isActive: false,
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...initialState,

  setQuery: (query) => {
    set({ query });
  },

  executeSearch: (versions, query) => {
    if (!query.trim()) {
      set(initialState);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = versions
      .filter((v) => v.content.toLowerCase().includes(lowerQuery))
      .map((v) => v.id);

    set({
      query,
      matches,
      total: matches.length,
      currentIndex: matches.length > 0 ? 0 : -1,
      isActive: true,
    });
  },

  nextMatch: () => {
    const { matches, currentIndex } = get();
    if (matches.length === 0) return;

    set({
      currentIndex: (currentIndex + 1) % matches.length,
    });
  },

  prevMatch: () => {
    const { matches, currentIndex } = get();
    if (matches.length === 0) return;

    set({
      currentIndex: (currentIndex - 1 + matches.length) % matches.length,
    });
  },

  clearSearch: () => {
    set(initialState);
  },

  focusMatch: (index) => {
    const { matches } = get();
    if (index < 0 || index >= matches.length) return;

    set({ currentIndex: index });
  },
}));
