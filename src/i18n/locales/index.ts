/**
 * 翻译数据索引
 * 导出所有语言的翻译数据
 */

import { zhCN } from './zh-CN';
import { enUS } from './en-US';
import type { Locale, TranslationData } from '../types';

/**
 * 所有语言的翻译数据
 */
export const translations: Record<Locale, TranslationData> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};