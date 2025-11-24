/**
 * i18n Context 和 Hook
 * 提供翻译函数给所有组件
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { translations } from './locales';

/**
 * 翻译函数类型
 * @param key - 翻译键，使用点号分隔（如 'common.save'）
 * @returns 翻译后的文本
 */
type TranslationFunction = (key: string) => string;

const I18nContext = createContext<TranslationFunction | null>(null);

/**
 * I18n Provider
 * 提供翻译函数给所有子组件
 */
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentLocale = useI18nStore((state) => state.currentLocale);

  const t: TranslationFunction = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[currentLocale];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key} for locale: ${currentLocale}`);
        return key; // 回退到键名
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
};

/**
 * 使用翻译函数的 Hook
 * @returns 翻译函数
 */
export const useTranslation = (): TranslationFunction => {
  const t = useContext(I18nContext);
  if (!t) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return t;
};