# Phase 1: Data Model - Monaco Editor 配置

**Feature**: Monaco Editor 编辑器替换  
**Date**: 2025-11-18

## Overview

本文档定义 Monaco Editor 集成所需的数据模型和配置结构。主要包括：编辑器主题配置、编辑器选项、Diff Editor 配置等。

---

## 1. 编辑器主题配置

### 1.1 M3 主题数据结构

```typescript
import type { editor } from 'monaco-editor';

/**
 * Material Design 3 编辑器主题配置
 */
interface M3EditorTheme extends editor.IStandaloneThemeData {
  /** 基础主题 */
  base: 'vs' | 'vs-dark' | 'hc-black';
  
  /** 是否继承基础主题 */
  inherit: boolean;
  
  /** 语法高亮规则 */
  rules: editor.ITokenThemeRule[];
  
  /** 编辑器颜色配置 */
  colors: editor.IColors;
}

/**
 * 语法高亮规则
 */
interface ITokenThemeRule {
  /** Token 类型（如 'header', 'emphasis'） */
  token: string;
  
  /** 前景色（十六进制） */
  foreground?: string;
  
  /** 背景色（十六进制） */
  background?: string;
  
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'bold' | 'underline';
}
```

### 1.2 M3 色彩方案映射

基于种子色 `#cfe883` 生成的 M3 色彩：

```typescript
/**
 * M3 色彩常量
 */
const M3_COLORS = {
  // Surface 层级
  surface: '#fdfcf5',
  surfaceVariant: '#e4e3d6',
  onSurface: '#1b1c18',
  onSurfaceVariant: '#74786d',
  
  // Primary 主色
  primary: '#a8c548',
  primaryContainer: '#d9f799',
  onPrimary: '#2a2b24',
  
  // Secondary 辅助色
  secondary: '#5d6148',
  secondaryContainer: '#e1e4c8',
  
  // Tertiary 第三色
  tertiary: '#39665a',
  tertiaryContainer: '#bcebdc',
  
  // Error 错误色
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  
  // Outline 边框
  outline: '#74786d',
  outlineVariant: '#c4c8ba',
  
  // Diff 颜色
  diffInserted: '#c6e48b',
  diffRemoved: '#ff7575',
  
  // 功能色
  searchMatch: '#ffd699',
  link: '#0061a4',
  code: '#8c4a00',
} as const;
```

### 1.3 主题配置示例

```typescript
export const m3EditorTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'header', fontStyle: 'bold', foreground: '536b00' },
    { token: 'emphasis', fontStyle: 'italic', foreground: '2a2b24' },
    { token: 'strong', fontStyle: 'bold', foreground: '2a2b24' },
    { token: 'link', foreground: '0061a4', fontStyle: 'underline' },
    { token: 'code', foreground: '8c4a00', background: 'f5f1e8' },
  ],
  colors: {
    'editor.background': '#fdfcf5',
    'editor.foreground': '#1b1c18',
    'editorCursor.foreground': '#a8c548',
    'editor.selectionBackground': '#d9f799',
    'editorLineNumber.foreground': '#74786d',
    'editorGutter.background': '#e4e3d6',
    'diffEditor.insertedTextBackground': '#c6e48b33',
    'diffEditor.removedTextBackground': '#ff757533',
  },
};
```

---

## 2. 编辑器选项配置

### 2.1 编辑器选项数据结构

```typescript
import type { editor } from 'monaco-editor';

/**
 * Monaco 编辑器选项
 * 从用户设置映射到 Monaco 配置
 */
interface EditorOptions extends editor.IStandaloneEditorConstructionOptions {
  /** 字体大小（像素） */
  fontSize: number;
  
  /** 行高（像素或相对值） */
  lineHeight: number;
  
  /** 字体族 */
  fontFamily: string;
  
  /** 是否只读 */
  readOnly: boolean;
  
  /** 是否显示行号 */
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  
  /** 是否显示缩略图 */
  minimap: {
    enabled: boolean;
  };
  
  /** 是否滚动到最后一行之后 */
  scrollBeyondLastLine: boolean;
  
  /** 自动换行 */
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  
  /** 是否启用代码折叠 */
  folding: boolean;
  
  /** 当前行高亮 */
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
}
```

### 2.2 配置映射函数

```typescript
/**
 * 从应用设置转换为 Monaco 编辑器选项
 */
function mapSettingsToEditorOptions(settings: {
  editorFontSize: number;
  editorLineHeight: number;
  readOnly?: boolean;
}): editor.IStandaloneEditorConstructionOptions {
  return {
    fontSize: settings.editorFontSize,
    lineHeight: settings.editorLineHeight,
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    readOnly: settings.readOnly ?? false,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    folding: true,
    renderLineHighlight: 'line',
    
    // 其他推荐选项
    automaticLayout: true,        // 自动调整布局
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    bracketPairColorization: {
      enabled: true,              // 括号配对着色
    },
    smoothScrolling: true,        // 平滑滚动
  };
}
```

---

## 3. Diff Editor 配置

### 3.1 Diff Editor 选项

```typescript
import type { editor } from 'monaco-editor';

/**
 * Monaco Diff Editor 选项
 */
interface DiffEditorOptions extends editor.IStandaloneDiffEditorConstructionOptions {
  /** 是否并排显示 */
  renderSideBySide: boolean;
  
  /** 是否允许编辑 */
  readOnly: boolean;
  
  /** 是否启用分割视图调整大小 */
  enableSplitViewResizing: boolean;
  
  /** 是否忽略首尾空白 */
  ignoreTrimWhitespace: boolean;
  
  /** 是否渲染概览尺 */
  renderOverviewRuler: boolean;
  
  /** 是否允许编辑原始内容 */
  originalEditable: boolean;
  
  /** 字体大小 */
  fontSize: number;
  
  /** 行高 */
  lineHeight: number;
}
```

### 3.2 Diff 配置示例

```typescript
/**
 * 创建 Diff Editor 默认选项
 */
function createDiffEditorOptions(
  fontSize: number = 14,
  lineHeight: number = 21
): editor.IStandaloneDiffEditorConstructionOptions {
  return {
    renderSideBySide: true,
    readOnly: true,
    enableSplitViewResizing: false,
    ignoreTrimWhitespace: true,
    renderOverviewRuler: true,
    originalEditable: false,
    fontSize,
    lineHeight,
    
    // 继承编辑器选项
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
  };
}
```

---

## 4. 编辑器状态管理

### 4.1 编辑器实例引用

```typescript
import type { editor, Monaco } from 'monaco-editor';

/**
 * 编辑器实例引用
 */
interface EditorRefs {
  /** Monaco 编辑器实例 */
  editor: editor.IStandaloneCodeEditor | null;
  
  /** Monaco 全局对象 */
  monaco: Monaco | null;
  
  /** Diff 编辑器实例 */
  diffEditor: editor.IStandaloneDiffEditor | null;
}
```

### 4.2 编辑器事件

```typescript
/**
 * 编辑器事件回调
 */
interface EditorEvents {
  /** 内容变化 */
  onChange?: (value: string) => void;
  
  /** 保存（Ctrl+Enter） */
  onSave?: () => void;
  
  /** 原地保存（Ctrl+Shift+Enter） */
  onSaveInPlace?: () => void;
  
  /** 编辑器挂载完成 */
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  
  /** 编辑器挂载前 */
  beforeMount?: (monaco: Monaco) => void;
}
```

---

## 5. 快捷键配置

### 5.1 快捷键定义

```typescript
import type { editor, Monaco, KeyCode, KeyMod } from 'monaco-editor';

/**
 * 自定义快捷键配置
 */
interface KeyBindingConfig {
  /** 快捷键组合（KeyMod + KeyCode） */
  keybinding: number;
  
  /** 执行的命令 */
  handler: () => void;
  
  /** 快捷键上下文（可选） */
  context?: string;
}

/**
 * 应用快捷键配置
 */
const APP_KEYBINDINGS: KeyBindingConfig[] = [
  {
    // Ctrl+Enter: 保存为新版本
    keybinding: KeyMod.CtrlCmd | KeyCode.Enter,
    handler: () => console.log('Save as new version'),
  },
  {
    // Ctrl+Shift+Enter: 原地保存
    keybinding: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter,
    handler: () => console.log('Save in place'),
  },
];
```

### 5.2 快捷键注册函数

```typescript
/**
 * 注册自定义快捷键
 */
function registerKeybindings(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  keybindings: KeyBindingConfig[]
): void {
  keybindings.forEach((kb) => {
    editor.addCommand(kb.keybinding, kb.handler);
  });
}
```

---

## 6. 语言配置

### 6.1 Markdown 语言支持

Monaco Editor 内置 Markdown 支持，无需额外配置。

```typescript
/**
 * Markdown 编辑器配置
 */
const MARKDOWN_EDITOR_CONFIG = {
  language: 'markdown',
  
  // Markdown 特定选项
  wordWrap: 'on',              // 自动换行（Markdown 常用）
  quickSuggestions: false,     // 禁用自动建议（Markdown 不需要）
  formatOnPaste: true,         // 粘贴时格式化
  formatOnType: true,          // 输入时格式化
} as const;
```

### 6.2 自定义 Markdown 语法（可选）

如需增强语法高亮，可以自定义 Monarch 语法定义：

```typescript
import type { languages } from 'monaco-editor';

/**
 * 自定义 Markdown 语法定义（可选）
 */
const CUSTOM_MARKDOWN_LANGUAGE: languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // 标题
      [/^#{1,6}\s.*$/, 'header'],
      
      // 粗体
      [/\*\*.*?\*\*/, 'strong'],
      
      // 斜体
      [/\*.*?\*/, 'emphasis'],
      
      // 行内代码
      [/`[^`]+`/, 'code'],
      
      // 链接
      [/\[.*?\]\(.*?\)/, 'link'],
      
      // 代码块
      [/```[\s\S]*?```/, 'code.block'],
    ],
  },
};

/**
 * 注册自定义 Markdown 语法
 */
function registerCustomMarkdown(monaco: Monaco): void {
  monaco.languages.setMonarchTokensProvider('markdown', CUSTOM_MARKDOWN_LANGUAGE);
}
```

---

## 7. 性能配置

### 7.1 Web Worker 配置

```typescript
/**
 * Monaco Editor Web Worker 配置
 */
interface WorkerConfig {
  /** 获取 Worker 函数 */
  getWorker: (workerId: string, label: string) => Worker;
}

/**
 * 设置 Web Worker 环境
 */
function setupMonacoWorkers(): void {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      // 对于 Markdown 编辑器，只需要基础 editor worker
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
        { type: 'module' }
      );
    },
  };
}
```

### 7.2 懒加载配置

```typescript
import { loader } from '@monaco-editor/react';

/**
 * 配置 Monaco Editor 懒加载
 */
function configureMonacoLoader(): void {
  // 可选：使用 CDN 加载
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
    },
  });
  
  // 或者使用本地路径（默认）
  // loader.config({ monaco });
}
```

---

## 8. 差异计算数据结构

### 8.1 Diff 结果

虽然使用 Monaco Diff Editor 进行可视化，但相似度计算仍使用现有的 `diffService`：

```typescript
/**
 * Diff 操作类型
 */
type DiffOperation = 'insert' | 'delete' | 'equal';

/**
 * Diff 结果项
 */
interface DiffResult {
  operation: DiffOperation;
  text: string;
}

/**
 * 相似度统计
 */
interface SimilarityStats {
  /** 相似度百分比 (0-100) */
  similarity: number;
  
  /** 插入行数 */
  insertedLines: number;
  
  /** 删除行数 */
  deletedLines: number;
  
  /** 相同行数 */
  equalLines: number;
  
  /** 总行数 */
  totalLines: number;
}
```

### 8.2 Diff 服务接口

```typescript
/**
 * Diff 服务接口（保持现有实现）
 */
interface DiffService {
  /**
   * 计算两个文本的差异
   */
  computeDiff(left: string, right: string): DiffResult[];
  
  /**
   * 计算相似度
   */
  computeSimilarity(left: string, right: string): number;
  
  /**
   * 计算详细统计
   */
  computeStats(left: string, right: string): SimilarityStats;
}
```

---

## 9. 组件状态数据

### 9.1 编辑器组件状态

```typescript
/**
 * Monaco Editor 组件内部状态
 */
interface EditorComponentState {
  /** 编辑器是否已加载 */
  isLoaded: boolean;
  
  /** 编辑器是否正在加载 */
  isLoading: boolean;
  
  /** 当前编辑器值 */
  value: string;
  
  /** 错误状态 */
  error: Error | null;
}
```

### 9.2 Diff 编辑器组件状态

```typescript
/**
 * Monaco Diff Editor 组件内部状态
 */
interface DiffEditorComponentState {
  /** Diff 编辑器是否已加载 */
  isLoaded: boolean;
  
  /** 原始内容 */
  original: string;
  
  /** 修改后内容 */
  modified: string;
  
  /** 相似度统计 */
  stats: SimilarityStats | null;
  
  /** 错误状态 */
  error: Error | null;
}
```

---

## 10. 配置验证

### 10.1 验证规则

```typescript
/**
 * 编辑器选项验证
 */
interface EditorOptionsValidation {
  /** 字体大小范围 */
  fontSize: {
    min: number;
    max: number;
    default: number;
  };
  
  /** 行高范围 */
  lineHeight: {
    min: number;
    max: number;
    default: number;
  };
}

const EDITOR_OPTIONS_VALIDATION: EditorOptionsValidation = {
  fontSize: {
    min: 10,
    max: 24,
    default: 14,
  },
  lineHeight: {
    min: 16,
    max: 36,
    default: 21,
  },
};

/**
 * 验证并规范化编辑器选项
 */
function validateEditorOptions(options: Partial<EditorOptions>): EditorOptions {
  const { fontSize, lineHeight } = options;
  
  return {
    ...options,
    fontSize: clamp(
      fontSize ?? EDITOR_OPTIONS_VALIDATION.fontSize.default,
      EDITOR_OPTIONS_VALIDATION.fontSize.min,
      EDITOR_OPTIONS_VALIDATION.fontSize.max
    ),
    lineHeight: clamp(
      lineHeight ?? EDITOR_OPTIONS_VALIDATION.lineHeight.default,
      EDITOR_OPTIONS_VALIDATION.lineHeight.min,
      EDITOR_OPTIONS_VALIDATION.lineHeight.max
    ),
  } as EditorOptions;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

---

## 11. 数据流图

```
用户设置 (settingsStore)
    ↓
    editorFontSize, editorLineHeight
    ↓
mapSettingsToEditorOptions()
    ↓
Monaco Editor Options
    ↓
    ┌─────────────────────────────┐
    │  MonacoEditor Component     │
    │  - fontSize: 14             │
    │  - lineHeight: 21           │
    │  - readOnly: false          │
    │  - theme: 'm3-theme'        │
    └─────────────────────────────┘
    ↓
onChange(value)
    ↓
父组件状态更新
    ↓
保存到 IndexedDB (versionManager)
```

---

## 12. 类型定义导出

```typescript
// src/components/editor/types.ts

export type {
  EditorOptions,
  DiffEditorOptions,
  EditorEvents,
  EditorRefs,
  KeyBindingConfig,
  DiffResult,
  SimilarityStats,
  EditorComponentState,
  DiffEditorComponentState,
};

export {
  M3_COLORS,
  m3EditorTheme,
  MARKDOWN_EDITOR_CONFIG,
  EDITOR_OPTIONS_VALIDATION,
};

export {
  mapSettingsToEditorOptions,
  createDiffEditorOptions,
  registerKeybindings,
  validateEditorOptions,
};
```

---

## 总结

本数据模型定义了 Monaco Editor 集成的所有核心数据结构：

1. **主题配置**: M3 色彩方案映射到 Monaco 主题
2. **编辑器选项**: 从应用设置到 Monaco 配置的转换
3. **Diff 配置**: Diff Editor 的选项和状态
4. **快捷键**: 自定义快捷键的定义和注册
5. **状态管理**: 组件内部状态和事件流
6. **验证规则**: 配置参数的验证和规范化

所有数据结构都与现有的应用架构（Zustand store、IndexedDB）兼容，确保平滑集成。
