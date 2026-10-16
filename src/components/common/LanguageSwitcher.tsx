import React from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { useTranslation } from '@/i18n/I18nContext';
import { Icons } from '@/components/icons/Icons';
import { MinimalButton } from '@/components/common/MinimalButton';

/**
 * 语言切换器组件
 * 显示当前语言并支持切换中英文
 */
export const LanguageSwitcher: React.FC = () => {
  const { currentLocale, toggleLocale } = useI18nStore();
  const t = useTranslation();

  const currentLanguageName = currentLocale === 'zh-CN' ? '中文' : 'English';

  return (
    <MinimalButton
      variant="ghost"
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 !text-masthead-on/75 hover:!text-masthead-on hover:!bg-masthead-on/10"
      title={t('common.switchLanguage')}
      aria-label={t('common.switchLanguage')}
    >
      <Icons.Language className="w-5 h-5" />
      {/* 语言标识按"登记表上的字段"处理：等宽 + 字距 */}
      <span className="font-mono text-xs uppercase tracking-label">{currentLanguageName}</span>
    </MinimalButton>
  );
};
