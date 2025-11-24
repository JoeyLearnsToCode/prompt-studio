# Data Model: 国际化数据结构

**Feature**: 003-i18n  
**Date**: 2025-11-24  
**Status**: Final

## 概述

本文档定义 i18n 功能的数据结构，包括语言配置、翻译数据、状态管理等核心数据模型。

## 核心类型定义

### 1. 语言代码类型

```typescript
// src/i18n/types.ts

/**
 * 支持的语言代码
 * 当前支持：简体中文、美式英文
 */
export type Locale = 'zh-CN' | 'en-US';

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  code: Locale;
  /** 语言的显示名称（用于UI） */
  name: string;
  /** 语言的原生名称 */
  nativeName: string;
}

/**
 * 所有支持的语言配置
 */
export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: '中文',
    nativeName: '简体中文',
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English (US)',
  },
};

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: Locale = 'en-US';
```

### 2. 翻译数据结构

```typescript
// src/i18n/types.ts

/**
 * 翻译数据的完整类型定义
 * 使用嵌套对象结构，按功能模块组织
 */
export interface TranslationData {
  /** 通用文本 */
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    close: string;
    edit: string;
    create: string;
    search: string;
    settings: string;
    export: string;
    import: string;
    back: string;
    next: string;
    finish: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    
    /** 语言切换器 */
    languageSwitcher: {
      tooltip: string;
      chinese: string;
      english: string;
    };
  };
  
  /** 页面文本 */
  pages: {
    /** 主视图 */
    mainView: {
      title: string;
      noProject: string;
      noProjectHint: string;
      versionName: string;
      versionNamePlaceholder: string;
      attachments: string;
    };
    
    /** 设置页 */
    settings: {
      title: string;
      webdav: string;
      webdavUrl: string;
      webdavUsername: string;
      webdavPassword: string;
      theme: string;
      themeLight: string;
      themeDark: string;
      themeAuto: string;
      editor: string;
      editorFontSize: string;
      editorLineHeight: string;
      backup: string;
      restore: string;
      clearData: string;
      clearDataConfirm: string;
    };
    
    /** 代码片段库 */
    snippetLibrary: {
      title: string;
      createSnippet: string;
      editSnippet: string;
      deleteSnippet: string;
      snippetName: string;
      snippetContent: string;
      noSnippets: string;
    };
  };
  
  /** 组件文本 */
  components: {
    /** 编辑器 */
    editor: {
      placeholder: string;
    };
    
    /** 工具栏 */
    toolbar: {
      saveNew: string;
      saveInPlace: string;
      compare: string;
      export: string;
      undo: string;
      redo: string;
    };
    
    /** 侧边栏 */
    sidebar: {
      projects: string;
      createProject: string;
      createFolder: string;
      renameProject: string;
      deleteProject: string;
      noProjects: string;
    };
    
    /** 版本画布 */
    canvas: {
      zoomIn: string;
      zoomOut: string;
      resetZoom: string;
      fitToScreen: string;
      search: string;
      searchPlaceholder: string;
      noResults: string;
    };
    
    /** 版本卡片 */
    versionCard: {
      createdAt: string;
      updatedAt: string;
      score: string;
      notes: string;
      duplicate: string;
      delete: string;
      compare: string;
    };
    
    /** 对比模态框 */
    compareModal: {
      title: string;
      source: string;
      target: string;
      close: string;
      noDifference: string;
    };
    
    /** 附件画廊 */
    attachmentGallery: {
      upload: string;
      delete: string;
      preview: string;
      download: string;
      noAttachments: string;
    };
  };
  
  /** 示例数据 */
  sampleData: {
    projectName: string;
    versions: {
      root: {
        name: string;
        content: string;
      };
      branch1: {
        name: string;
        content: string;
      };
      branch2: {
        name: string;
        content: string;
      };
    };
  };
  
  /** 错误消息 */
  errors: {
    generic: string;
    networkError: string;
    fileNotFound: string;
    invalidInput: string;
    saveFailed: string;
    loadFailed: string;
    deleteFailed: string;
    exportFailed: string;
    importFailed: string;
  };
}
```

### 3. 状态管理

```typescript
// src/store/i18nStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/types';

/**
 * i18n 状态接口
 */
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
      currentLocale: 'zh-CN', // 默认值，会被初始化逻辑覆盖
      
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
      name: 'language', // LocalStorage 键名
      version: 1, // 版本号，用于迁移
    }
  )
);
```

## 翻译数据组织

### 目录结构

```
src/i18n/
├── types.ts              # 类型定义
├── locales/              # 翻译数据
│   ├── zh-CN.ts         # 中文翻译
│   ├── en-US.ts         # 英文翻译
│   └── index.ts         # 导出所有语言
├── I18nContext.tsx      # React Context
├── useTranslation.ts    # 翻译 Hook
└── detectLanguage.ts    # 语言检测工具
```

### 翻译文件示例

```typescript
// src/i18n/locales/zh-CN.ts

import type { TranslationData } from '../types';

export const zhCN: TranslationData = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    // ... 其他通用文本
    languageSwitcher: {
      tooltip: '这里可以切换语言',
      chinese: '中文',
      english: 'English',
    },
  },
  pages: {
    mainView: {
      title: 'Prompt Studio',
      noProject: '请先选择或创建项目',
      // ... 其他主视图文本
    },
    // ... 其他页面
  },
  components: {
    // ... 组件文本
  },
  sampleData: {
    // ... 示例数据
  },
  errors: {
    // ... 错误消息
  },
};
```

```typescript
// src/i18n/locales/index.ts

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
```

## Context 和 Hook

### I18nContext

```typescript
// src/i18n/I18nContext.tsx

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
```

## 语言检测

```typescript
// src/i18n/detectLanguage.ts

import type { Locale } from './types';
import { DEFAULT_LOCALE } from './types';

/**
 * 检测浏览器语言偏好
 * @returns 检测到的语言代码
 */
export function detectBrowserLanguage(): Locale {
  try {
    // 优先使用 navigator.languages
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
```

## LocalStorage 数据结构

### 语言偏好存储

```json
{
  "state": {
    "currentLocale": "zh-CN"
  },
  "version": 1
}
```

**键名**: `language`  
**格式**: JSON  
**说明**: Zustand persist 中间件自动管理

## 数据流

```
1. 应用启动
   ↓
2. 读取 LocalStorage
   ├─ 有保存的语言 → 使用保存的语言
   └─ 无保存的语言 → 检测浏览器语言
   ↓
3. 初始化 i18nStore
   ↓
4. I18nProvider 提供翻译函数
   ↓
5. 组件使用 useTranslation() 获取翻译
   ↓
6. 用户切换语言
   ↓
7. 更新 i18nStore
   ↓
8. 自动保存到 LocalStorage
   ↓
9. 所有组件重新渲染（使用新语言）
```

## 类型安全

### 翻译键的类型检查

虽然当前使用字符串键（如 `'common.save'`），但 TypeScript 会在编译时检查翻译数据的结构：

```typescript
// 所有语言必须实现相同的接口
const zhCN: TranslationData = { /* ... */ };
const enUS: TranslationData = { /* ... */ };

// 如果结构不匹配，TypeScript 会报错
```

### 未来改进

可以通过类型生成工具创建更强的类型检查：

```typescript
// 自动生成的类型
type TranslationKey = 
  | 'common.save'
  | 'common.cancel'
  | 'pages.mainView.title'
  // ... 所有可能的键

// 翻译函数使用生成的类型
type TranslationFunction = (key: TranslationKey) => string;
```

## 扩展性

### 添加新语言

1. 在 `Locale` 类型中添加新的语言代码
2. 在 `SUPPORTED_LOCALES` 中添加配置
3. 创建新的翻译文件（如 `ja-JP.ts`）
4. 在 `locales/index.ts` 中注册
5. 更新语言切换 UI（如果需要）

### 添加新的翻译键

1. 在 `TranslationData` 接口中添加新键
2. 在所有语言文件中添加对应的翻译
3. TypeScript 会确保所有语言都实现了新键

## 性能考虑

- **初始化**: 翻译数据在构建时打包，无运行时加载开销
- **查找**: 对象属性查找，O(1) 时间复杂度
- **内存**: 所有翻译数据常驻内存，约 10-20KB
- **切换**: 状态更新触发组件重渲染，React 自动优化

## 总结

本数据模型设计具有以下特点：

1. **类型安全**: 使用 TypeScript 确保翻译数据结构一致
2. **易于维护**: 按功能模块组织，清晰的目录结构
3. **高性能**: 简单的对象查找，无额外开销
4. **可扩展**: 易于添加新语言和新翻译键
5. **持久化**: 自动保存用户语言偏好