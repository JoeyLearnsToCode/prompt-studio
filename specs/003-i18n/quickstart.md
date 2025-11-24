# Quick Start Guide: 国际化实施

**Feature**: 003-i18n  
**Date**: 2025-11-24  
**Audience**: 开发人员

## 概述

本指南提供 i18n 功能的快速实施步骤，帮助开发人员快速上手并完成国际化功能的开发。

## 前置条件

- 已阅读 [`plan.md`](plan.md) 了解整体技术方案
- 已阅读 [`data-model.md`](data-model.md) 了解数据结构
- 熟悉 React、TypeScript、Zustand

## 实施步骤

### 第一步：创建基础结构

#### 1.1 创建类型定义

创建 [`src/i18n/types.ts`](../../src/i18n/types.ts):

```typescript
export type Locale = 'zh-CN' | 'en-US';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  'zh-CN': { code: 'zh-CN', name: '中文', nativeName: '简体中文' },
  'en-US': { code: 'en-US', name: 'English', nativeName: 'English (US)' },
};

export const DEFAULT_LOCALE: Locale = 'en-US';
```

#### 1.2 创建语言检测工具

创建 [`src/i18n/detectLanguage.ts`](../../src/i18n/detectLanguage.ts):

```typescript
import type { Locale } from './types';
import { DEFAULT_LOCALE } from './types';

export function detectBrowserLanguage(): Locale {
  try {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      if (lang.toLowerCase().startsWith('zh')) {
        return 'zh-CN';
      }
    }
    
    return DEFAULT_LOCALE;
  } catch (error) {
    console.error('Failed to detect browser language:', error);
    return DEFAULT_LOCALE;
  }
}

export function initializeLanguage(): Locale {
  try {
    const stored = localStorage.getItem('language');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.currentLocale) {
        const locale = parsed.state.currentLocale as string;
        if (locale === 'zh-CN' || locale === 'en-US') {
          return locale;
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse stored language:', error);
  }
  
  return detectBrowserLanguage();
}
```

### 第二步：创建状态管理

#### 2.1 创建 i18n Store

创建 [`src/store/i18nStore.ts`](../../src/store/i18nStore.ts):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/types';
import { initializeLanguage } from '@/i18n/detectLanguage';

interface I18nState {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLocale: initializeLanguage(),
      
      setLocale: (locale) => set({ currentLocale: locale }),
      
      toggleLocale: () => {
        const current = get().currentLocale;
        const next = current === 'zh-CN' ? 'en-US' : 'zh-CN';
        set({ currentLocale: next });
      },
    }),
    {
      name: 'language',
      version: 1,
    }
  )
);
```

### 第三步：创建翻译数据

#### 3.1 提取现有文本

使用正则搜索找出所有硬编码的中文文本：

```bash
# 在项目根目录执行
grep -r "[\u4e00-\u9fa5]" src/ --include="*.tsx" --include="*.ts"
```

#### 3.2 创建中文翻译文件

创建 [`src/i18n/locales/zh-CN.ts`](../../src/i18n/locales/zh-CN.ts)，包含所有提取的文本。

#### 3.3 创建英文翻译文件

创建 [`src/i18n/locales/en-US.ts`](../../src/i18n/locales/en-US.ts)，翻译所有中文文本。

#### 3.4 导出翻译数据

创建 [`src/i18n/locales/index.ts`](../../src/i18n/locales/index.ts):

```typescript
import { zhCN } from './zh-CN';
import { enUS } from './en-US';
import type { Locale } from '../types';

export const translations: Record<Locale, any> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};
```

### 第四步：创建 Context 和 Hook

#### 4.1 创建 I18nContext

创建 [`src/i18n/I18nContext.tsx`](../../src/i18n/I18nContext.tsx):

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { translations } from './locales';

type TranslationFunction = (key: string) => string;

const I18nContext = createContext<TranslationFunction | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentLocale = useI18nStore((state) => state.currentLocale);
  
  const t: TranslationFunction = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[currentLocale];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): TranslationFunction => {
  const t = useContext(I18nContext);
  if (!t) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return t;
};
```

#### 4.2 在应用中集成 Provider

修改 [`src/main.tsx`](../../src/main.tsx)，添加 I18nProvider：

```typescript
import { I18nProvider } from '@/i18n/I18nContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

### 第五步：创建语言切换组件

#### 5.1 创建 LanguageSwitcher 组件

创建 [`src/components/common/LanguageSwitcher.tsx`](../../src/components/common/LanguageSwitcher.tsx):

```typescript
import React from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { useTranslation } from '@/i18n/I18nContext';
import { SUPPORTED_LOCALES } from '@/i18n/types';

export const LanguageSwitcher: React.FC = () => {
  const { currentLocale, toggleLocale } = useI18nStore();
  const t = useTranslation();
  
  const currentConfig = SUPPORTED_LOCALES[currentLocale];
  
  return (
    <button
      onClick={toggleLocale}
      className="p-2 rounded-full hover:bg-onPrimary/20 transition-colors flex items-center gap-2"
      aria-label={t('common.languageSwitcher.tooltip')}
      title={t('common.languageSwitcher.tooltip')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="text-sm">{currentConfig.name}</span>
    </button>
  );
};
```

#### 5.2 集成到主界面

修改 [`src/pages/MainView.tsx`](../../src/pages/MainView.tsx)，在设置按钮左侧添加语言切换按钮：

```typescript
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

// 在 header 中添加
<header className="bg-primary text-onPrimary px-6 py-1 shadow-m3-1 flex items-center justify-between">
  <h1 className="text-2xl font-bold">Prompt Studio</h1>
  <div className="flex items-center gap-2">
    <LanguageSwitcher />
    <button onClick={() => navigate('/settings')} ...>
      {/* 设置按钮 */}
    </button>
  </div>
</header>
```

### 第六步：更新组件使用翻译

#### 6.1 更新组件示例

在每个组件中：

1. 导入 `useTranslation` Hook
2. 调用 Hook 获取翻译函数
3. 替换硬编码文本为翻译键

示例：

```typescript
import { useTranslation } from '@/i18n/I18nContext';

const MyComponent: React.FC = () => {
  const t = useTranslation();
  
  return (
    <div>
      <button>{t('common.save')}</button>
      <button>{t('common.cancel')}</button>
    </div>
  );
};
```

#### 6.2 批量更新

按优先级更新组件：
1. 主界面 ([`MainView.tsx`](../../src/pages/MainView.tsx))
2. 设置页 ([`Settings.tsx`](../../src/pages/Settings.tsx))
3. 编辑器工具栏 ([`EditorToolbar.tsx`](../../src/components/editor/EditorToolbar.tsx))
4. 侧边栏 ([`Sidebar.tsx`](../../src/components/layout/Sidebar.tsx))
5. 其他组件

### 第七步：更新示例数据

修改 [`src/services/initializeSampleData.ts`](../../src/services/initializeSampleData.ts):

```typescript
import { useI18nStore } from '@/store/i18nStore';
import { translations } from '@/i18n/locales';

async function createSampleProject(): Promise<string> {
  const currentLocale = useI18nStore.getState().currentLocale;
  const t = translations[currentLocale].sampleData;
  
  const project = await projectManager.createProject(t.projectName, null as any);
  
  const rootVersion = await versionManager.createVersion(
    project.id,
    t.versions.root.content,
    null,
    undefined,
    t.versions.root.name
  );
  
  // ... 其他版本
}
```

### 第八步：测试

#### 8.1 单元测试

创建 [`tests/unit/detectLanguage.test.ts`](../../tests/unit/detectLanguage.test.ts):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { detectBrowserLanguage } from '@/i18n/detectLanguage';

describe('detectBrowserLanguage', () => {
  it('should detect Chinese', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['zh-CN'],
      configurable: true,
    });
    expect(detectBrowserLanguage()).toBe('zh-CN');
  });
  
  it('should default to English for other languages', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['fr-FR'],
      configurable: true,
    });
    expect(detectBrowserLanguage()).toBe('en-US');
  });
});
```

#### 8.2 组件测试

创建 [`tests/component/LanguageSwitcher.test.tsx`](../../tests/component/LanguageSwitcher.test.tsx):

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { I18nProvider } from '@/i18n/I18nContext';

describe('LanguageSwitcher', () => {
  it('should toggle language on click', () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // 验证语言已切换
  });
});
```

#### 8.3 浏览器 E2E 测试

使用 chrome-devtools-mcp 测试完整流程：

```typescript
// 1. 启动应用
// 2. 验证默认语言
// 3. 点击语言切换按钮
// 4. 验证所有文本已更新
// 5. 刷新页面
// 6. 验证语言保持
```

## 常见问题

### Q: 如何添加新的翻译键？

A: 
1. 在 [`zh-CN.ts`](../../src/i18n/locales/zh-CN.ts) 中添加中文翻译
2. 在 [`en-US.ts`](../../src/i18n/locales/en-US.ts) 中添加英文翻译
3. 在组件中使用 `t('your.new.key')`

### Q: 如何添加新语言？

A:
1. 在 `Locale` 类型中添加新语言代码
2. 在 `SUPPORTED_LOCALES` 中添加配置
3. 创建新的翻译文件（如 `ja-JP.ts`）
4. 在 `locales/index.ts` 中注册
5. 更新语言切换 UI（如果需要下拉选择）

### Q: 翻译键找不到怎么办？

A: 系统会在控制台输出警告，并回退显示键名。检查：
1. 键名是否正确
2. 翻译文件中是否存在该键
3. 翻译数据结构是否正确

### Q: 如何处理动态文本？

A: 当前方案不支持插值。如需动态文本，可以：
1. 使用字符串拼接（简单场景）
2. 扩展翻译函数支持插值（复杂场景）

## 验收标准

完成以下检查项后，i18n 功能即可交付：

- [ ] 所有翻译文件已创建并包含完整翻译
- [ ] 所有组件已更新使用翻译函数
- [ ] 语言切换按钮已集成到主界面
- [ ] 语言偏好正确保存到 LocalStorage
- [ ] 浏览器语言检测正常工作
- [ ] 示例数据支持多语言
- [ ] 单元测试通过
- [ ] 组件测试通过
- [ ] 浏览器 E2E 测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成

## 下一步

完成 i18n 功能后，可以考虑：

1. 添加更多语言支持
2. 实现插值功能
3. 添加日期、数字格式化
4. 集成专业翻译服务
5. 实现语言包懒加载

## 参考资料

- [规范文档](./spec.md)
- [实施计划](./plan.md)
- [数据模型](./data-model.md)
- [技术调研](./research.md)