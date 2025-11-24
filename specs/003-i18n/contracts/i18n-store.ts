/**
 * i18n Store 接口契约
 * 定义语言状态管理的接口规范
 */

import type { Locale } from '@/i18n/types';

/**
 * i18n 状态接口
 */
export interface I18nState {
  /** 当前语言代码 */
  currentLocale: Locale;
  
  /**
   * 设置当前语言
   * @param locale - 目标语言代码
   */
  setLocale: (locale: Locale) => void;
  
  /**
   * 切换语言（中英文循环）
   * 当前为中文时切换到英文，当前为英文时切换到中文
   */
  toggleLocale: () => void;
}

/**
 * Store 行为契约
 */
export interface I18nStoreContract {
  /**
   * 初始化行为：
   * 1. 优先从 LocalStorage 读取保存的语言偏好
   * 2. 如果没有保存的偏好，检测浏览器语言
   * 3. 如果检测失败，使用默认语言（英文）
   */
  initialization: {
    priority: ['localStorage', 'browserDetection', 'default'];
    defaultLocale: 'en-US';
  };
  
  /**
   * 持久化行为：
   * 使用 Zustand persist 中间件自动保存到 LocalStorage
   */
  persistence: {
    storageKey: 'language';
    storageType: 'localStorage';
    version: 1;
  };
  
  /**
   * 切换行为：
   * toggleLocale() 在两种语言之间循环切换
   */
  toggle: {
    'zh-CN': 'en-US';
    'en-US': 'zh-CN';
  };
}