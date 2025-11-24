# Research Document: 国际化技术方案调研

**Feature**: 003-i18n  
**Date**: 2025-11-24  
**Status**: Completed

## 研究目标

为 Prompt Studio 选择合适的国际化（i18n）技术方案，需要满足以下要求：
1. 轻量级，不增加过多依赖
2. 与现有技术栈（React + Zustand）良好集成
3. 支持类型安全
4. 易于扩展新语言

## 方案对比

### 方案 1: react-i18next

**优点**:
- 功能最完整，支持插值、复数、命名空间、语言检测等
- 生态成熟，文档完善
- TypeScript 支持良好

**缺点**:
- 包体积较大（~50KB gzipped）
- 需要引入 i18next 核心库
- 配置相对复杂
- 对于简单场景有过度工程的问题

**适用场景**: 大型应用，需要复杂的国际化功能

### 方案 2: react-intl (FormatJS)

**优点**:
- 功能强大，支持日期、时间、数字格式化
- 基于 ICU Message 标准
- TypeScript 支持

**缺点**:
- 包体积更大（~60KB gzipped）
- 学习曲线陡峭
- 对于只需要文本翻译的场景过于复杂

**适用场景**: 需要复杂格式化功能的国际化应用

### 方案 3: 轻量级自实现（推荐）

**优点**:
- 零额外依赖，使用现有的 Zustand 和 React Context
- 完全控制实现细节
- 包体积最小（~2KB）
- TypeScript 原生支持，类型安全
- 实现简单，易于理解和维护

**缺点**:
- 功能相对简单，不支持复杂的插值和格式化
- 需要自己实现语言检测和回退逻辑

**适用场景**: 中小型应用，只需要简单的文本翻译

## 技术决策

### 选择方案 3：轻量级自实现

**理由**:
1. **符合项目定位**: Prompt Studio 是本地优先的单页应用，不需要复杂的国际化功能
2. **保持轻量**: 不引入额外依赖，保持应用轻量级
3. **类型安全**: 使用 TypeScript 定义翻译数据结构，编译时检查
4. **易于扩展**: 未来如需添加新语言，只需添加新的翻译文件
5. **与现有技术栈集成**: 使用 Zustand 管理状态，React Context 提供翻译函数

## 实现方案细节

### 1. 状态管理

使用 Zustand 的 persist 中间件管理当前语言状态：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface I18nState {
  currentLocale: 'zh-CN' | 'en-US';
  setLocale: (locale: 'zh-CN' | 'en-US') => void;
  toggleLocale: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLocale: 'zh-CN',
      setLocale: (locale) => set({ currentLocale: locale }),
      toggleLocale: () => {
        const current = get().currentLocale;
        set({ currentLocale: current === 'zh-CN' ? 'en-US' : 'zh-CN' });
      },
    }),
    { name: 'language' }
  )
);
```

**优势**:
- 自动持久化到 LocalStorage
- 类型安全
- 与现有 Store 模式一致

### 2. 翻译数据组织

使用 TypeScript 模块导出翻译对象：

```typescript
// src/i18n/locales/zh-CN.ts
export const zhCN = {
  common: { save: '保存', cancel: '取消' },
  pages: { mainView: { title: 'Prompt Studio' } },
  // ...
};

// src/i18n/locales/en-US.ts
export const enUS = {
  common: { save: 'Save', cancel: 'Cancel' },
  pages: { mainView: { title: 'Prompt Studio' } },
  // ...
};

// src/i18n/locales/index.ts
export const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
};
```

**优势**:
- 按语言组织，易于维护
- TypeScript 类型推导
- 支持代码分割（如果需要）

### 3. 翻译函数提供

使用 React Context 提供翻译函数：

```typescript
// src/i18n/I18nContext.tsx
import React, { createContext, useContext } from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { translations } from './locales';

type TranslationFunction = (key: string) => string;

const I18nContext = createContext<TranslationFunction | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentLocale = useI18nStore((state) => state.currentLocale);
  
  const t: TranslationFunction = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[currentLocale];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // 回退到键名
    }
    
    return value;
  };
  
  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const t = useContext(I18nContext);
  if (!t) throw new Error('useTranslation must be used within I18nProvider');
  return t;
};
```

**优势**:
- 简单直观的 API
- 自动响应语言切换
- 性能优化（Context 只提供函数，不存储翻译数据）

### 4. 语言检测

```typescript
// src/i18n/detectLanguage.ts
export function detectBrowserLanguage(): 'zh-CN' | 'en-US' {
  try {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      if (lang.toLowerCase().startsWith('zh')) {
        return 'zh-CN';
      }
    }
    
    return 'en-US'; // 默认英文
  } catch {
    return 'en-US';
  }
}
```

**优势**:
- 支持多个浏览器语言偏好
- 容错处理
- 简单的匹配逻辑

## 性能考虑

### 1. 初始化性能

- 翻译数据在构建时被打包，无需运行时加载
- 语言检测只在应用启动时执行一次
- Zustand 的 persist 中间件异步读取 LocalStorage，不阻塞渲染

### 2. 切换性能

- 语言切换通过 Zustand 状态更新触发
- Context 提供的翻译函数会触发所有使用它的组件重新渲染
- 由于翻译函数内部逻辑简单（对象属性查找），性能影响极小

### 3. 包体积

- 自实现方案：~2KB
- 中文翻译数据：~5KB
- 英文翻译数据：~5KB
- **总增量**: ~12KB (gzipped 后约 4KB)

相比 react-i18next（~50KB），节省 **92%** 的包体积。

## 类型安全

使用 TypeScript 的类型推导确保翻译键的正确性：

```typescript
// 定义翻译数据的类型
type TranslationKeys = typeof zhCN;

// 确保所有语言的结构一致
export const enUS: TranslationKeys = {
  common: { save: 'Save', cancel: 'Cancel' },
  // TypeScript 会检查结构是否匹配
};
```

未来可以通过生成类型文件实现更强的类型检查，但当前方案已足够。

## 扩展性

### 添加新语言

1. 创建新的翻译文件：`src/i18n/locales/ja-JP.ts`
2. 导出翻译对象，确保结构与现有语言一致
3. 在 `index.ts` 中注册新语言
4. 更新 `Locale` 类型定义
5. 更新语言切换 UI（如果切换为下拉选择）

### 支持插值

如果未来需要支持插值（如 "Hello, {name}"），可以扩展翻译函数：

```typescript
const t = (key: string, params?: Record<string, string>) => {
  let text = getTranslation(key);
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  
  return text;
};
```

## 测试策略

### 单元测试

- 语言检测函数（各种浏览器语言配置）
- 翻译函数（键查找、回退逻辑）
- Store 行为（切换语言、持久化）

### 组件测试

- 语言切换按钮交互
- 组件在不同语言下的渲染

### E2E 测试

- 完整的语言切换流程
- 持久化验证（刷新页面后语言保持）

## 结论

轻量级自实现方案是当前项目的最佳选择：
- ✅ 满足所有功能需求
- ✅ 保持应用轻量级
- ✅ 类型安全
- ✅ 易于扩展
- ✅ 与现有技术栈完美集成

如果未来需求增长（如需要复杂的格式化、插值、复数等），可以考虑迁移到 react-i18next，但当前阶段不推荐。