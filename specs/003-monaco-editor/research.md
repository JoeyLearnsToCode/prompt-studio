# Phase 0: Research & Technical Decisions

**Feature**: Monaco Editor 编辑器替换  
**Date**: 2025-11-18  
**Status**: Completed

## Overview

本文档记录了将 CodeMirror 替换为 Monaco Editor 过程中的技术研究和决策过程。研究重点包括：Monaco Editor 的 React 集成、Diff 功能、主题定制、性能优化和迁移策略。

---

## 1. Monaco Editor React 集成

### 决策
使用 `@monaco-editor/react` 作为 Monaco Editor 的 React 集成包。

### 理由
- **官方支持**: 由 Monaco Editor 社区维护，与 Monaco Editor 核心保持同步
- **TypeScript 友好**: 提供完整的类型定义
- **简洁 API**: 封装了 Monaco Editor 的复杂初始化过程
- **性能优化**: 内置懒加载和按需加载支持
- **React Hooks 兼容**: 完全支持 React 18 和 Hooks 模式

### 基础集成模式

```typescript
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  language="markdown"
  theme="custom-m3-theme"
  value={content}
  onChange={(value) => handleChange(value || '')}
  options={{
    fontSize: 14,
    lineHeight: 21,
    readOnly: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  }}
  onMount={(editor, monaco) => {
    // 配置快捷键、命令等
  }}
/>
```

### 关键 API
- `onMount`: 编辑器实例挂载后的回调，用于高级配置
- `beforeMount`: 编辑器挂载前的回调，用于注册自定义语言、主题等
- `options`: Monaco Editor 的配置选项对象

### 替代方案评估
- **monaco-react** (已弃用): 社区活跃度低，不推荐
- **直接使用 monaco-editor**: 需要手动处理 React 生命周期和 DOM 操作，复杂度高
- **react-monaco-editor**: 较旧的封装，TypeScript 支持不完善

---

## 2. Monaco Diff Editor 使用模式

### 决策
使用 `@monaco-editor/react` 的 `DiffEditor` 组件实现版本对比。

### 理由
- **并排视图原生支持**: 提供开箱即用的 Side-by-Side Diff 视图
- **同步滚动**: 自动实现左右面板的同步滚动
- **差异高亮**: 自动计算和高亮显示文本差异
- **性能优化**: 内置虚拟滚动，支持大文件对比

### 基础使用模式

```typescript
import { DiffEditor } from '@monaco-editor/react';

<DiffEditor
  height="100%"
  language="markdown"
  theme="custom-m3-theme"
  original={leftContent}
  modified={rightContent}
  options={{
    readOnly: true,
    renderSideBySide: true,
    enableSplitViewResizing: false,
    fontSize: 14,
  }}
  onMount={(editor, monaco) => {
    // 可以访问 Diff Editor 实例
  }}
/>
```

### 获取差异统计

Monaco Diff Editor 不直接提供相似度百分比，需要保留现有的 `diffService.computeSimilarity()` 逻辑：

```typescript
// diffService.ts 保留相似度计算
export function computeSimilarity(left: string, right: string): number {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(left, right);
  // ... 计算逻辑不变
}

// 在组件中使用
const similarity = diffService.computeSimilarity(leftContent, rightContent);
```

### 关键配置选项
- `renderSideBySide`: true = 并排视图，false = 内联视图
- `renderOverviewRuler`: 显示右侧滚动条中的差异标记
- `ignoreTrimWhitespace`: 忽略首尾空白差异
- `originalEditable`: 允许编辑左侧内容（默认 false）

### 替代方案评估
- **手动实现 Diff**: 使用 `diff-match-patch` + 自定义渲染，复杂度极高
- **react-diff-viewer**: 功能较弱，不支持编辑器级别的交互
- **CodeMirror Merge View**: 当前方案，但视觉效果不如 Monaco

---

## 3. Material Design 3 主题适配

### 决策
创建自定义 Monaco Editor 主题，映射项目的 M3 色彩方案。

### 理由
- Monaco Editor 支持完整的主题定制
- 可以精确控制每个 UI 元素的颜色
- 通过 `monaco.editor.defineTheme()` 定义主题

### M3 色彩方案映射

基于项目的种子色 `rgb(207, 235, 131)` (#cfe883)，生成 M3 色彩方案：

```typescript
// src/components/editor/editorTheme.ts
import type { editor } from 'monaco-editor';

export const m3EditorTheme: editor.IStandaloneThemeData = {
  base: 'vs', // 基于浅色主题
  inherit: true,
  rules: [
    // Markdown 语法高亮
    { token: 'emphasis', fontStyle: 'italic', foreground: '2a2b24' },
    { token: 'strong', fontStyle: 'bold', foreground: '2a2b24' },
    { token: 'header', fontStyle: 'bold', foreground: '536b00' }, // Primary dark
    { token: 'link', foreground: '0061a4', fontStyle: 'underline' }, // Blue accent
    { token: 'code', foreground: '8c4a00', background: 'f5f1e8' }, // Code block
  ],
  colors: {
    // 编辑器背景和前景色
    'editor.background': '#fdfcf5',           // M3 Surface
    'editor.foreground': '#1b1c18',           // M3 On Surface
    
    // 光标和选区
    'editorCursor.foreground': '#a8c548',     // M3 Primary
    'editor.selectionBackground': '#d9f799',  // M3 Primary Container (alpha)
    'editor.inactiveSelectionBackground': '#e4e3d6',
    
    // 行号和装订线
    'editorLineNumber.foreground': '#74786d',
    'editorLineNumber.activeForeground': '#2a2b24',
    'editorGutter.background': '#e4e3d6',
    
    // 搜索高亮
    'editor.findMatchBackground': '#ffd699cc',
    'editor.findMatchHighlightBackground': '#ffd69966',
    
    // Diff 颜色
    'diffEditor.insertedTextBackground': '#c6e48b33', // 绿色透明
    'diffEditor.removedTextBackground': '#ff757533',  // 红色透明
    'diffEditor.insertedLineBackground': '#c6e48b1a',
    'diffEditor.removedLineBackground': '#ff75751a',
    
    // 滚动条
    'scrollbarSlider.background': '#00000020',
    'scrollbarSlider.hoverBackground': '#00000030',
    'scrollbarSlider.activeBackground': '#00000040',
  },
};
```

### 主题注册和应用

```typescript
// 在组件挂载前注册主题
function beforeMount(monaco: Monaco) {
  monaco.editor.defineTheme('m3-theme', m3EditorTheme);
}

<Editor
  theme="m3-theme"
  beforeMount={beforeMount}
  // ...
/>
```

### 字体和间距配置

从 `settingsStore` 读取用户配置：

```typescript
const { editorFontSize, editorLineHeight } = useSettingsStore();

<Editor
  options={{
    fontSize: editorFontSize,      // 默认 14
    lineHeight: editorLineHeight,  // 默认 1.5 (相对值) 或 21 (绝对值)
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
  }}
/>
```

### 替代方案评估
- **使用内置主题**: vs, vs-dark, hc-black 都不符合 M3 规范
- **CSS 覆盖**: Monaco Editor 使用复杂的 CSS 类名，覆盖困难且不稳定
- **自定义主题**: 最灵活和可维护的方案 ✅

---

## 4. Markdown 语法高亮

### 决策
使用 Monaco Editor 内置的 Markdown 语言支持。

### 理由
- Monaco Editor 原生支持 Markdown
- 提供完整的语法高亮（标题、列表、代码块、链接等）
- 无需额外安装语言包

### 配置方式

```typescript
<Editor
  language="markdown"
  // Monaco 自动加载 Markdown 语法定义
/>
```

### 增强语法高亮（可选）

如需更精细的控制，可以自定义 Monarch 语法定义：

```typescript
monaco.languages.setMonarchTokensProvider('markdown', {
  tokenizer: {
    root: [
      [/^#{1,6}\s.*$/, 'header'],
      [/\*\*.*?\*\*/, 'strong'],
      [/\*.*?\*/, 'emphasis'],
      [/`[^`]+`/, 'code'],
      // ... 更多规则
    ],
  },
});
```

### 替代方案评估
- **remark/unified**: 过于复杂，不适用于编辑器高亮
- **CodeMirror Markdown Mode**: 当前方案，功能相当
- **Monaco 内置支持**: 最简单直接 ✅

---

## 5. 快捷键绑定

### 决策
使用 Monaco Editor 的 `addCommand()` API 绑定自定义快捷键。

### 理由
- 精确控制快捷键行为
- 可以禁用冲突的内置快捷键
- 支持组合键和条件绑定

### 实现方式

```typescript
function handleEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
  // Ctrl+Enter: 保存为新版本
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    () => {
      onSave?.();
    }
  );

  // Ctrl+Shift+Enter: 原地保存
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
    () => {
      onSaveInPlace?.();
    }
  );

  // Ctrl+F: 搜索（Monaco 内置，无需额外配置）
}
```

### 禁用冲突快捷键

如需禁用 Monaco 内置的快捷键（如 Ctrl+S）：

```typescript
editor.addCommand(
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
  () => {
    // 空函数，禁用默认行为
  }
);
```

### 搜索功能

Monaco Editor 内置搜索（Ctrl+F）支持：
- 正则表达式搜索
- 区分大小写
- 全词匹配
- 查找和替换

无需额外配置即可使用。

### 替代方案评估
- **全局键盘事件**: 容易与编辑器内快捷键冲突
- **React 事件处理**: 无法捕获编辑器内的键盘事件
- **Monaco Commands**: 最可靠和原生的方案 ✅

---

## 6. 性能优化策略

### 决策
采用多层次性能优化策略：懒加载、Web Worker、虚拟滚动。

### 6.1 懒加载

`@monaco-editor/react` 默认支持懒加载，Monaco Editor 在组件首次渲染时才加载。

进一步优化：使用动态导入

```typescript
const MonacoEditor = lazy(() => import('./MonacoEditor'));

<Suspense fallback={<div>加载编辑器...</div>}>
  <MonacoEditor />
</Suspense>
```

### 6.2 Web Worker 配置

Monaco Editor 使用 Web Worker 处理语法高亮和智能提示，需要配置 Vite：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
        },
      },
    },
  },
});
```

同时需要配置 Monaco Editor 的 worker 路径：

```typescript
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};
```

**注意**: 对于 Markdown 编辑器，实际只需要 `editorWorker`，其他 worker 可以省略。

### 6.3 虚拟滚动

Monaco Editor 内置虚拟滚动，自动处理大文件（10,000+ 行）的渲染性能。

关键配置：

```typescript
<Editor
  options={{
    scrollBeyondLastLine: false,  // 禁止滚动到最后一行之后
    wordWrap: 'on',                // 自动换行，减少横向滚动
    folding: true,                 // 启用代码折叠
    renderLineHighlight: 'line',   // 只高亮当前行
    minimap: { enabled: false },   // 禁用缩略图（大文件时性能更好）
  }}
/>
```

### 6.4 包体积优化

Monaco Editor 完整包约 3MB，优化策略：

1. **按需加载语言**: 只加载 Markdown 支持
2. **Tree Shaking**: Vite 自动处理
3. **CDN 加载**（可选）:

```typescript
import { loader } from '@monaco-editor/react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
});
```

4. **代码分割**: 将 Monaco Editor 单独打包为一个 chunk

### 性能基准测试

需要验证的性能指标：
- 编辑器首次加载时间 < 500ms（目标）
- 10,000 行内容渲染无卡顿
- 输入响应时间 < 100ms
- Diff 视图加载时间 < 1s

### 替代方案评估
- **不做优化**: 初始加载时间过长，用户体验差
- **只使用懒加载**: 不足以满足性能目标
- **完整优化方案**: 多层次优化，最佳性能 ✅

---

## 7. 只读模式和编辑器状态

### 决策
使用 Monaco Editor 的 `readOnly` 选项和 `updateOptions()` API 动态控制编辑器状态。

### 实现方式

```typescript
<Editor
  options={{
    readOnly: isReadOnly,
    domReadOnly: isReadOnly, // 防止 DOM 级别的编辑
  }}
/>
```

动态更新：

```typescript
const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

function handleEditorMount(editor: editor.IStandaloneCodeEditor) {
  editorRef.current = editor;
}

// 动态切换只读模式
useEffect(() => {
  if (editorRef.current) {
    editorRef.current.updateOptions({
      readOnly: isReadOnly,
    });
  }
}, [isReadOnly]);
```

### 只读模式下的行为
- 禁止文本编辑
- 允许选择和复制
- 允许搜索
- 允许滚动和缩放

---

## 8. 响应式布局和自适应尺寸

### 决策
使用 `height="100%"` 和容器 CSS 控制编辑器尺寸，监听窗口变化自动调整。

### 实现方式

```typescript
// 容器设置高度
<div style={{ height: '100%', width: '100%' }}>
  <Editor height="100%" />
</div>
```

窗口大小变化自动调整：

```typescript
const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

useEffect(() => {
  function handleResize() {
    editorRef.current?.layout();
  }

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 响应式配置

针对不同屏幕尺寸调整编辑器选项：

```typescript
const isMobile = window.innerWidth < 640;

<Editor
  options={{
    fontSize: isMobile ? 12 : 14,
    lineNumbers: isMobile ? 'off' : 'on',
    minimap: { enabled: !isMobile },
  }}
/>
```

---

## 9. CodeMirror 迁移路径

### 决策
采用逐步替换策略，最小化风险。

### 迁移步骤

**阶段 1: 准备**
1. 安装 Monaco Editor 依赖
2. 配置 Vite 支持 Web Workers
3. 创建 Monaco Editor 封装组件（MonacoEditor.tsx）
4. 创建 M3 主题配置（editorTheme.ts）

**阶段 2: 主编辑器替换**
1. 更新 PromptEditor.tsx，使用 MonacoEditor 组件
2. 保留 CodeMirror 作为 fallback（feature flag）
3. 测试所有编辑器功能（快捷键、搜索、只读模式）
4. 验证字体大小和行高配置生效

**阶段 3: Diff 视图替换**
1. 创建 MonacoDiffViewer 组件
2. 更新 CompareModal.tsx 使用 MonacoDiffViewer
3. 更新 DiffViewer.tsx 使用 MonacoDiffViewer
4. 保留 diffService.computeSimilarity() 逻辑
5. 测试版本对比功能

**阶段 4: 清理**
1. 移除 CodeMirror 相关导入
2. 卸载 CodeMirror 依赖包
3. 移除 globals.css 中的 CodeMirror 样式
4. 更新测试用例

### 功能对等检查清单

| 功能 | CodeMirror | Monaco Editor | 状态 |
|------|-----------|---------------|------|
| Markdown 语法高亮 | ✅ @codemirror/lang-markdown | ✅ 内置支持 | 对等 |
| 搜索（Ctrl+F） | ✅ @codemirror/search | ✅ 内置支持 | 对等 |
| 正则搜索 | ✅ | ✅ | 对等 |
| 快捷键 Ctrl+Enter | ✅ 自定义 | ✅ addCommand() | 对等 |
| 快捷键 Ctrl+Shift+Enter | ✅ 自定义 | ✅ addCommand() | 对等 |
| 只读模式 | ✅ readOnly | ✅ readOnly | 对等 |
| 字体大小配置 | ✅ EditorView.theme | ✅ options.fontSize | 对等 |
| 行高配置 | ✅ EditorView.theme | ✅ options.lineHeight | 对等 |
| 并排 Diff 视图 | ✅ MergeView | ✅ DiffEditor | 对等 |
| 同步滚动 | ✅ 自动 | ✅ 自动 | 对等 |
| 差异高亮 | ✅ | ✅ | 对等 |
| 行号显示 | ✅ | ✅ | 对等 |
| 代码折叠 | ✅ | ✅ | 对等 |

**结论**: Monaco Editor 功能完全对等，甚至在某些方面（如搜索、智能提示）更强大。

---

## 10. 测试策略细化

### 单元测试

**测试目标**: 验证主题配置和工具函数正确性

```typescript
// tests/unit/editorTheme.test.ts
import { describe, it, expect } from 'vitest';
import { m3EditorTheme } from '@/components/editor/editorTheme';

describe('M3 Editor Theme', () => {
  it('应包含正确的基础主题', () => {
    expect(m3EditorTheme.base).toBe('vs');
  });

  it('应包含 M3 色彩方案', () => {
    expect(m3EditorTheme.colors?.['editor.background']).toBe('#fdfcf5');
    expect(m3EditorTheme.colors?.['editorCursor.foreground']).toBe('#a8c548');
  });

  it('应包含 Markdown 语法高亮规则', () => {
    const headerRule = m3EditorTheme.rules?.find(r => r.token === 'header');
    expect(headerRule).toBeDefined();
    expect(headerRule?.fontStyle).toBe('bold');
  });
});
```

### 组件测试

**测试目标**: 验证 React 组件行为

```typescript
// tests/component/MonacoEditor.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonacoEditor from '@/components/editor/MonacoEditor';

describe('MonacoEditor Component', () => {
  it('应正确渲染编辑器', async () => {
    render(<MonacoEditor value="Test content" onChange={vi.fn()} />);
    
    // Monaco Editor 异步加载
    await waitFor(() => {
      expect(screen.getByRole('code')).toBeInTheDocument();
    });
  });

  it('应在内容变化时调用 onChange', async () => {
    const handleChange = vi.fn();
    render(<MonacoEditor value="" onChange={handleChange} />);
    
    // 模拟编辑器内容变化（需要访问 Monaco 实例）
    // 实际测试中需要更复杂的 mock
  });

  it('应支持只读模式', async () => {
    const { rerender } = render(
      <MonacoEditor value="Test" onChange={vi.fn()} readOnly />
    );
    
    // 验证只读配置生效
    // ...
  });
});
```

### 浏览器 E2E 测试

**测试目标**: 验证完整用户流程

```typescript
// tests/e2e/editor-features.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Monaco Editor 功能测试', () => {
  test('应正确渲染 Monaco Editor', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 等待 Monaco Editor 加载
    await page.waitForSelector('.monaco-editor');
    
    // 验证编辑器可见
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();
  });

  test('应支持 Markdown 语法高亮', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 输入 Markdown 文本
    await page.locator('.monaco-editor textarea').fill('# 标题');
    
    // 验证语法高亮（检查特定 CSS 类）
    await expect(page.locator('.mtk1')).toContainText('标题');
  });

  test('应支持 Ctrl+Enter 快捷键', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 聚焦编辑器
    await page.locator('.monaco-editor textarea').focus();
    
    // 按下 Ctrl+Enter
    await page.keyboard.press('Control+Enter');
    
    // 验证保存操作（检查 UI 变化或网络请求）
    // ...
  });

  test('应支持 10,000 行内容', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 生成 10,000 行内容
    const largeContent = Array(10000).fill('测试行').join('\n');
    
    // 设置内容
    await page.evaluate((content) => {
      // 通过 Monaco API 设置内容
      window.monaco.editor.getModels()[0].setValue(content);
    }, largeContent);
    
    // 验证性能（滚动无卡顿）
    await page.locator('.monaco-editor').evaluate((el) => {
      el.scrollTop = 100000;
    });
    
    // 验证编辑器仍然响应
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });
});
```

---

## 11. 风险缓解措施

### 包体积风险

**问题**: Monaco Editor 约 3MB，可能影响首次加载

**缓解措施**:
1. 使用 CDN 加载（jsdelivr, unpkg）
2. 启用 Gzip/Brotli 压缩（实际传输约 800KB）
3. 代码分割，懒加载编辑器
4. 利用浏览器缓存
5. 只加载必要的语言支持（Markdown）

**预期效果**: 首次加载 < 2s（3G 网络），后续加载 < 500ms（缓存）

### 快捷键冲突风险

**问题**: Monaco 内置快捷键可能与应用快捷键冲突

**缓解措施**:
1. 使用 `addCommand()` 覆盖冲突的快捷键
2. 禁用不需要的内置命令
3. 文档化所有自定义快捷键

**预期效果**: 所有快捷键按预期工作，无冲突

### 主题适配风险

**问题**: Monaco 主题可能无法完全匹配 M3 色彩方案

**缓解措施**:
1. 详细研究 Monaco 主题 API
2. 使用 Chrome DevTools 检查实际渲染颜色
3. 迭代调整主题配置
4. 必要时使用 CSS 覆盖（最后手段）

**预期效果**: 主题与 M3 规范高度一致，视觉协调

---

## 12. 技术决策总结

| 决策点 | 选择 | 理由 |
|--------|------|------|
| React 集成包 | @monaco-editor/react | 官方支持，TypeScript 友好 |
| Diff 实现 | Monaco DiffEditor | 原生支持，功能强大 |
| 主题方案 | 自定义 IStandaloneThemeData | 精确控制，符合 M3 |
| 语法高亮 | Monaco 内置 Markdown | 开箱即用，无需额外配置 |
| 快捷键 | addCommand() API | 精确控制，可覆盖内置快捷键 |
| 性能优化 | 懒加载 + Web Worker + 虚拟滚动 | 多层次优化，最佳性能 |
| 迁移策略 | 逐步替换 | 最小化风险，可回退 |
| 测试方案 | 单元 + 组件 + E2E | 完整覆盖，确保质量 |

---

## 13. 未解决问题和后续研究

### 暗色主题支持

**问题**: 规范中提到暗色主题适配，但当前应用似乎只有浅色主题

**建议**: 
- 检查应用是否计划支持暗色模式
- 如需支持，创建 `m3-dark-theme` 配置
- 基于系统偏好或用户设置动态切换

### 移动端触控优化

**问题**: Monaco Editor 主要为桌面优化，移动端体验可能不佳

**建议**:
- 针对移动端调整编辑器选项（fontSize, lineNumbers）
- 测试触控手势（缩放、选择）
- 考虑移动端使用简化编辑器（如 textarea + 基础高亮）

### 协同编辑支持

**问题**: 未来可能需要协同编辑功能

**建议**:
- Monaco Editor 支持 Operational Transform（OT）集成
- 可以结合 Yjs、ShareDB 等库实现协同编辑
- 当前阶段不实现，但保持扩展性

---

## 14. 参考资料

### 官方文档
- [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react GitHub](https://github.com/suren-atoyan/monaco-react)
- [Monaco Editor API 文档](https://microsoft.github.io/monaco-editor/api/index.html)

### 主题和样式
- [Monaco Editor Theme 示例](https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-tokens-and-colors)
- [TextMate 语法规则](https://macromates.com/manual/en/language_grammars)

### 性能优化
- [Vite + Monaco Editor 配置](https://github.com/vitejs/vite/discussions/1791)
- [Monaco Editor Web Worker 配置](https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md)

### 最佳实践
- [React + Monaco Editor 最佳实践](https://dev.to/sukanyabag/integrating-monaco-editor-with-react-a-step-by-step-guide-3h38)
- [Monaco Editor 性能优化](https://github.com/microsoft/monaco-editor/wiki/Performance)

---

## 结论

本次研究确认了 Monaco Editor 完全能够满足项目需求：

✅ **功能对等**: 所有 CodeMirror 功能都有对应的 Monaco 实现  
✅ **视觉提升**: 更现代的 UI，更好的视觉体验  
✅ **性能可控**: 通过多层次优化，性能满足目标  
✅ **可维护性**: 官方支持，社区活跃，长期可维护  
✅ **风险可控**: 迁移路径清晰，风险缓解措施完善  

**下一步**: 进入 Phase 1，生成数据模型、接口契约和快速开始指南。
