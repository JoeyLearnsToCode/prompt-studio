# Implementation Plan: 国际化支持 (i18n)

**Branch**: `003-i18n` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-i18n/spec.md`

## Summary

为 Prompt Studio 添加国际化支持，实现中英文界面切换。核心功能包括：
1. 浏览器语言自动检测（中文用户默认中文，其他用户默认英文）
2. 主界面右上角添加语言切换按钮（设置按钮左侧）
3. 语言偏好保存到 LocalStorage
4. 所有 UI 文本支持中英文
5. 示例数据根据当前语言生成

技术方案：采用轻量级自实现方案，使用 Zustand 管理语言状态，React Context 提供翻译函数，避免引入重量级 i18n 库。

## Technical Context

**Language/Version**: TypeScript 5.3+  
**Primary Dependencies**: React 18.2, Zustand 4.4, TailwindCSS 3.4, Vite 5.0  
**Storage**: IndexedDB (via Dexie.js) + LocalStorage  
**Testing**: Vitest (unit/component), React Testing Library, chrome-devtools-mcp (Browser E2E)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application  
**Performance Goals**: 语言切换响应时间 < 100ms，界面文本更新即时  
**Constraints**: 
- 不引入额外的 i18n 库依赖（保持轻量）
- 语言切换不影响用户正在编辑的内容
- 所有 UI 组件必须支持响应式语言更新
**Scale/Scope**: 
- 初期支持 2 种语言（中文、英文）
- 约 100+ 个 UI 文本键值对
- 架构支持未来扩展到 10+ 种语言

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **本地优先验证**: 所有功能在客户端完成，语言检测、切换、存储均在浏览器中进行
- [x] **Material Design 3 合规**: 语言切换按钮遵循 M3 规范，使用图标+文本组合
- [x] **平台无关性**: 核心 i18n 逻辑与 UI 分离，翻译数据独立管理
- [x] **扁平化数据**: 翻译数据以扁平键值对存储（如 `common.save`）
- [x] **可访问性标准**: 语言切换按钮支持键盘导航和 ARIA 标签
- [x] **轻量依赖**: 不引入额外 i18n 库，使用现有的 Zustand 和 React Context
- [x] **测试覆盖**: 包含语言检测单元测试、组件测试和浏览器 E2E 测试

## Project Structure

### Documentation (this feature)

```text
specs/003-i18n/
├── plan.md              # This file
├── research.md          # Phase 0 output (技术调研)
├── data-model.md        # Phase 1 output (数据模型设计)
├── quickstart.md        # Phase 1 output (快速开始指南)
├── contracts/           # Phase 1 output (接口契约)
│   ├── i18n-store.ts    # 语言状态管理接口
│   ├── translation.ts   # 翻译函数接口
│   └── locale-data.ts   # 翻译数据结构
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── i18n/                          # 新增：国际化模块
│   ├── locales/                   # 翻译数据
│   │   ├── zh-CN.ts              # 中文翻译
│   │   ├── en-US.ts              # 英文翻译
│   │   └── index.ts              # 导出所有语言
│   ├── I18nContext.tsx           # React Context 提供翻译函数
│   ├── useTranslation.ts         # 翻译 Hook
│   └── detectLanguage.ts         # 浏览器语言检测工具
│
├── store/
│   ├── i18nStore.ts              # 新增：语言状态管理
│   └── settingsStore.ts          # 修改：添加语言偏好持久化
│
├── components/
│   ├── common/
│   │   └── LanguageSwitcher.tsx  # 新增：语言切换按钮组件
│   └── [其他组件]                 # 修改：使用翻译函数替换硬编码文本
│
├── pages/
│   ├── MainView.tsx              # 修改：添加语言切换按钮
│   └── Settings.tsx              # 修改：国际化所有文本
│
└── services/
    └── initializeSampleData.ts   # 修改：根据语言生成示例数据

tests/
├── unit/
│   ├── detectLanguage.test.ts   # 新增：语言检测测试
│   └── i18nStore.test.ts        # 新增：状态管理测试
├── component/
│   └── LanguageSwitcher.test.tsx # 新增：组件测试
└── e2e/
    └── i18n-switching.e2e.ts    # 新增：浏览器 E2E 测试
```

**Structure Decision**: 采用单项目结构（Option 1），所有 i18n 相关代码集中在 `src/i18n/` 目录下，便于管理和扩展。翻译数据按语言代码组织（`zh-CN.ts`, `en-US.ts`），使用 TypeScript 确保类型安全。

## Complexity Tracking

无违反 Constitution Check 的情况，无需额外说明。

---

## Phase 0: Research & Technical Decisions

### 0.1 语言检测策略

**目标**: 确定如何检测用户浏览器语言偏好

**调研内容**:
1. `navigator.language` vs `navigator.languages`
2. 语言代码匹配规则（zh, zh-CN, zh-Hans, zh-TW 等）
3. 回退策略（检测失败时的默认行为）

**决策**:
- 优先使用 `navigator.languages[0]`，回退到 `navigator.language`
- 中文匹配规则：以 `zh` 开头的任何语言代码（zh, zh-CN, zh-Hans, zh-TW 等）
- 默认语言：英文（en-US）

### 0.2 翻译数据结构

**目标**: 设计可扩展的翻译数据结构

**调研内容**:
1. 扁平化 vs 嵌套结构
2. 命名空间划分（common, pages, components）
3. 插值和复数支持

**决策**:
- 使用嵌套对象结构，便于组织和维护
- 按功能模块划分命名空间：
  ```typescript
  {
    common: { save, cancel, delete, ... },
    pages: { mainView, settings, ... },
    components: { editor, canvas, ... }
  }
  ```
- 初期不支持插值和复数，保持简单

### 0.3 状态管理方案

**目标**: 确定语言状态的管理和传递方式

**调研内容**:
1. Zustand store vs React Context
2. 语言切换时的组件更新机制
3. LocalStorage 持久化策略

**决策**:
- 使用 Zustand 管理语言状态（`currentLocale`）
- 使用 React Context 提供翻译函数 `t(key)`
- 语言偏好保存到 LocalStorage（键名：`language`）
- 组件通过 `useTranslation()` Hook 获取翻译函数

### 0.4 UI 组件设计

**目标**: 设计语言切换按钮的交互和样式

**调研内容**:
1. 图标选择（地球图标 vs 语言图标）
2. 按钮位置和布局
3. 悬停提示文本

**决策**:
- 使用地球图标 + 当前语言名称（"中文" / "English"）
- 位置：主界面右上角，设置按钮左侧
- 悬停提示：根据当前语言显示"这里可以切换语言" / "Switch language here"
- 点击行为：循环切换（中文 ↔ 英文）

---

## Phase 1: Data Model & API Design

### 1.1 数据模型

#### 语言配置类型

```typescript
// src/i18n/types.ts

export type Locale = 'zh-CN' | 'en-US';

export interface LocaleConfig {
  code: Locale;
  name: string;        // 语言的本地化名称
  nativeName: string;  // 语言的原生名称
}

export type TranslationKeys = {
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    // ... 更多通用文本
  };
  pages: {
    mainView: {
      title: string;
      noProject: string;
      // ... 更多主视图文本
    };
    settings: {
      title: string;
      // ... 更多设置页文本
    };
  };
  components: {
    editor: {
      placeholder: string;
      // ... 更多编辑器文本
    };
    // ... 更多组件文本
  };
};

export type TranslationData = TranslationKeys;
```

#### 语言状态 Store

```typescript
// src/store/i18nStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/types';

interface I18nState {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLocale: 'zh-CN', // 默认值，会被初始化逻辑覆盖
      
      setLocale: (locale) => set({ currentLocale: locale }),
      
      toggleLocale: () => {
        const current = get().currentLocale;
        const next = current === 'zh-CN' ? 'en-US' : 'zh-CN';
        set({ currentLocale: next });
      },
    }),
    {
      name: 'language', // LocalStorage 键名
    }
  )
);
```

### 1.2 API 设计

#### 翻译函数接口

```typescript
// src/i18n/I18nContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useI18nStore } from '@/store/i18nStore';
import { translations } from './locales';
import type { Locale } from './types';

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
        return key; // 回退到键名
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

#### 语言检测工具

```typescript
// src/i18n/detectLanguage.ts

import type { Locale } from './types';

export function detectBrowserLanguage(): Locale {
  try {
    // 优先使用 navigator.languages
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      // 检查是否为中文
      if (lang.toLowerCase().startsWith('zh')) {
        return 'zh-CN';
      }
    }
    
    // 默认返回英文
    return 'en-US';
  } catch (error) {
    console.error('Failed to detect browser language:', error);
    return 'en-US'; // 检测失败时默认英文
  }
}

export function initializeLanguage(): Locale {
  // 检查 LocalStorage 中是否有保存的语言偏好
  const stored = localStorage.getItem('language');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.currentLocale) {
        return parsed.state.currentLocale as Locale;
      }
    } catch (error) {
      console.error('Failed to parse stored language:', error);
    }
  }
  
  // 如果没有保存的偏好，检测浏览器语言
  return detectBrowserLanguage();
}
```

### 1.3 翻译数据示例

```typescript
// src/i18n/locales/zh-CN.ts

export const zhCN = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    confirm: '确认',
    close: '关闭',
    edit: '编辑',
    create: '创建',
    search: '搜索',
    settings: '设置',
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
      noProjectHint: '点击左侧"创建项目"按钮开始',
      versionName: '版本名称',
      versionNamePlaceholder: '(可选) 为版本添加名称',
      attachments: '附件',
    },
    settings: {
      title: '设置',
      webdav: 'WebDAV 配置',
      theme: '主题',
      editor: '编辑器',
      // ... 更多设置项
    },
  },
  components: {
    editor: {
      placeholder: '在此输入提示词...',
    },
    toolbar: {
      saveNew: '保存新版本',
      saveInPlace: '原地保存',
      compare: '对比',
      export: '导出',
    },
    // ... 更多组件
  },
  sampleData: {
    projectName: '示例项目',
    versions: {
      root: {
        name: '小狗嬉戏',
        content: '一只可爱的小狗在春意盎然的公园草地上嬉戏',
      },
      branch1: {
        name: '帅气小狗',
        content: '一只威风凛凛帅气的德牧在春意盎然的公园草地上嬉戏',
      },
      branch2: {
        name: '冬日小狗',
        content: '一只可爱的小狗在冬季白雪覆盖的公园草地上嬉戏',
      },
    },
  },
};
```

```typescript
// src/i18n/locales/en-US.ts

export const enUS = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    settings: 'Settings',
    languageSwitcher: {
      tooltip: 'Switch language here',
      chinese: '中文',
      english: 'English',
    },
  },
  pages: {
    mainView: {
      title: 'Prompt Studio',
      noProject: 'Please select or create a project',
      noProjectHint: 'Click "Create Project" button on the left to start',
      versionName: 'Version Name',
      versionNamePlaceholder: '(Optional) Add a name for this version',
      attachments: 'Attachments',
    },
    settings: {
      title: 'Settings',
      webdav: 'WebDAV Configuration',
      theme: 'Theme',
      editor: 'Editor',
      // ... more settings
    },
  },
  components: {
    editor: {
      placeholder: 'Enter your prompt here...',
    },
    toolbar: {
      saveNew: 'Save New Version',
      saveInPlace: 'Save In Place',
      compare: 'Compare',
      export: 'Export',
    },
    // ... more components
  },
  sampleData: {
    projectName: 'Sample Project',
    versions: {
      root: {
        name: 'Playful Puppy',
        content: 'A cute puppy playing on the lush green grass in a spring park',
      },
      branch1: {
        name: 'Majestic Dog',
        content: 'A majestic German Shepherd playing on the lush green grass in a spring park',
      },
      branch2: {
        name: 'Winter Puppy',
        content: 'A cute puppy playing on the snow-covered grass in a winter park',
      },
    },
  },
};
```

---

## Phase 2: Implementation Tasks

详细的实施任务将在 `tasks.md` 中定义（由 `/speckit.tasks` 命令生成）。

### 高层次任务概览

1. **基础设施搭建**
   - 创建 i18n 目录结构
   - 实现语言检测工具
   - 创建 i18n Store
   - 实现 I18nContext 和 useTranslation Hook

2. **翻译数据准备**
   - 提取所有 UI 硬编码文本
   - 创建中文翻译文件
   - 创建英文翻译文件
   - 添加示例数据翻译

3. **UI 组件开发**
   - 实现 LanguageSwitcher 组件
   - 集成到 MainView 页面
   - 更新所有组件使用翻译函数

4. **示例数据国际化**
   - 修改 initializeSampleData 服务
   - 根据当前语言生成示例数据

5. **测试**
   - 单元测试：语言检测、Store
   - 组件测试：LanguageSwitcher
   - E2E 测试：完整的语言切换流程

6. **文档更新**
   - 更新 README 说明 i18n 功能
   - 添加贡献指南（如何添加新语言）

---

## Phase 3: Testing Strategy

### 3.1 单元测试

**文件**: `tests/unit/detectLanguage.test.ts`

测试语言检测逻辑：
- 检测中文浏览器（zh, zh-CN, zh-Hans, zh-TW）
- 检测英文浏览器（en, en-US, en-GB）
- 检测其他语言浏览器（回退到英文）
- 检测失败时的回退行为

**文件**: `tests/unit/i18nStore.test.ts`

测试状态管理：
- 初始化语言（从 LocalStorage 或浏览器检测）
- 切换语言
- 持久化到 LocalStorage

### 3.2 组件测试

**文件**: `tests/component/LanguageSwitcher.test.tsx`

测试语言切换按钮：
- 渲染正确的当前语言名称
- 点击切换语言
- 悬停显示提示文本
- 键盘导航支持

### 3.3 E2E 测试

**文件**: `tests/e2e/i18n-switching.e2e.ts`

使用 chrome-devtools-mcp 测试完整流程：
1. 启动应用，验证默认语言
2. 点击语言切换按钮
3. 验证所有 UI 文本更新
4. 刷新页面，验证语言保持
5. 验证示例数据使用正确语言

---

## Phase 4: Deployment & Rollout

### 4.1 部署检查清单

- [ ] 所有翻译文本已完成
- [ ] 所有组件已国际化
- [ ] 单元测试通过
- [ ] 组件测试通过
- [ ] E2E 测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成

### 4.2 回滚计划

如果发现严重问题：
1. 回滚到 master 分支
2. 修复问题
3. 重新测试
4. 重新部署

### 4.3 监控指标

- 语言切换成功率
- 翻译文本缺失率
- 用户语言分布
- 性能影响（语言切换响应时间）

---

## Appendix: Key Files to Modify

### 新增文件

1. `src/i18n/types.ts` - 类型定义
2. `src/i18n/locales/zh-CN.ts` - 中文翻译
3. `src/i18n/locales/en-US.ts` - 英文翻译
4. `src/i18n/locales/index.ts` - 导出所有语言
5. `src/i18n/I18nContext.tsx` - Context Provider
6. `src/i18n/useTranslation.ts` - 翻译 Hook
7. `src/i18n/detectLanguage.ts` - 语言检测工具
8. `src/store/i18nStore.ts` - 语言状态管理
9. `src/components/common/LanguageSwitcher.tsx` - 语言切换按钮

### 修改文件

1. `src/main.tsx` - 添加 I18nProvider
2. `src/pages/MainView.tsx` - 添加语言切换按钮，国际化文本
3. `src/pages/Settings.tsx` - 国际化所有设置项文本
4. `src/components/editor/EditorToolbar.tsx` - 国际化按钮文本
5. `src/components/canvas/VersionCanvas.tsx` - 国际化提示文本
6. `src/components/layout/Sidebar.tsx` - 国际化侧边栏文本
7. `src/services/initializeSampleData.ts` - 根据语言生成示例数据
8. 其他所有包含硬编码中文文本的组件

---

## Notes

- 本计划采用轻量级自实现方案，避免引入 react-i18next 等重量级库
- 翻译数据使用 TypeScript，确保类型安全和自动补全
- 语言切换使用 Zustand 的持久化中间件，自动保存到 LocalStorage
- 所有组件通过 `useTranslation()` Hook 获取翻译函数，保持一致性
- 示例数据国际化通过修改 `initializeSampleData.ts` 实现，根据当前语言生成不同内容