/**
 * 浏览器语言检测工具
 * 用于自动检测用户的语言偏好
 */

import type { Locale } from './types';
import { DEFAULT_LOCALE } from './types';

/**
 * 检测浏览器语言偏好
 * @returns 检测到的语言代码
 */
export function detectBrowserLanguage(): Locale {
  try {
    // 优先使用 navigator.languages，回退到 navigator.language
    const languages = navigator.languages || [navigator.language];

    for (const lang of languages) {
      const lowerLang = lang.toLowerCase();

      // 检查是否为中文（zh, zh-CN, zh-Hans, zh-TW 等）
      if (lowerLang.startsWith('zh')) {
        return 'zh-CN';
      }

      // 检查是否为英文
      if (lowerLang.startsWith('en')) {
        return 'en-US';
      }
    }

    // 默认返回英文
    return DEFAULT_LOCALE;
  } catch (error) {
    console.error('Failed to detect browser language:', error);
    return DEFAULT_LOCALE;
  }
}

/**
 * 初始化语言
 * 优先使用 LocalStorage 中保存的语言，否则检测浏览器语言
 * @returns 初始化的语言代码
 */
export function initializeLanguage(): Locale {
  try {
    // 检查 LocalStorage 中是否有保存的语言偏好
    const stored = localStorage.getItem('language');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.currentLocale) {
        const locale = parsed.state.currentLocale as string;
        // 验证是否为有效的语言代码
        if (locale === 'zh-CN' || locale === 'en-US') {
          return locale;
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse stored language:', error);
  }

  // 如果没有保存的偏好或解析失败，检测浏览器语言
  return detectBrowserLanguage();
}
