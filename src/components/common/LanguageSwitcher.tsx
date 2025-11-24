import React from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { useTranslation } from '@/i18n/I18nContext';

/**
 * 语言切换器组件
 * 显示当前语言并支持切换中英文
 */
export const LanguageSwitcher: React.FC = () => {
  const { currentLocale, toggleLocale } = useI18nStore();
  const t = useTranslation();

  const currentLanguageName = currentLocale === 'zh-CN' ? '中文' : 'English';

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-onPrimary/20 transition-colors"
      title={t('common.switchLanguage')}
      aria-label={t('common.switchLanguage')}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm font-medium">
        {currentLanguageName}
      </span>
    </button>
  );
};