/**
 * i18n 状态管理
 * 使用 Zustand 管理当前语言状态，并持久化到 LocalStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/types';
import { STORAGE_KEYS } from '@/utils/storage';
import { initializeLanguage } from '@/i18n/detectLanguage';

interface I18nState {
  /** 当前语言 */
  currentLocale: Locale;

  /** 设置语言 */
  setLocale: (locale: Locale) => void;

  /** 切换语言（中英文循环） */
  toggleLocale: () => void;
}

/**
 * i18n Store
 * 使用 Zustand 的 persist 中间件自动持久化到 LocalStorage
 */
export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLocale: initializeLanguage(),

      setLocale: (locale) => {
        set({ currentLocale: locale });
      },

      toggleLocale: () => {
        const current = get().currentLocale;
        const next = current === 'zh-CN' ? 'en-US' : 'zh-CN';
        set({ currentLocale: next });
      },
    }),
    {
      name: STORAGE_KEYS.UI_LANGUAGE, // LocalStorage 键名
      version: 1, // 版本号，用于迁移
    }
  )
);