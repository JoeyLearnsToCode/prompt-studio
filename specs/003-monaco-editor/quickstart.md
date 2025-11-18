# Quick Start: Monaco Editor 集成指南

**Feature**: Monaco Editor 编辑器替换  
**Date**: 2025-11-18  
**Target Audience**: 开发人员

本指南提供 Monaco Editor 集成的快速上手步骤，帮助开发人员在最短时间内完成编辑器替换。

---

## 📋 前置条件

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.0.0
- React >= 18.0.0
- Vite >= 5.0.0

---

## 🚀 快速开始

### 步骤 1: 安装依赖

```bash
# 安装 Monaco Editor 相关包
pnpm add monaco-editor @monaco-editor/react

# 安装类型定义（如果需要）
pnpm add -D @types/monaco-editor
```

### 步骤 2: 配置 Vite

编辑 `vite.config.ts`，添加 Monaco Editor 支持：

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

### 步骤 3: 创建主题配置

创建 `src/components/editor/editorTheme.ts`：

```typescript
// src/components/editor/editorTheme.ts
import type { editor } from 'monaco-editor';

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

### 步骤 4: 创建 Monaco Editor 组件

创建 `src/components/editor/MonacoEditor.tsx`：

```typescript
// src/components/editor/MonacoEditor.tsx
import { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { m3EditorTheme } from './editorTheme';
import { useSettingsStore } from '@/store/settingsStore';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSaveInPlace?: () => void;
  readOnly?: boolean;
  className?: string;
}

export default function MonacoEditor({
  value,
  onChange,
  onSave,
  onSaveInPlace,
  readOnly = false,
  className = '',
}: MonacoEditorProps) {
  const { editorFontSize, editorLineHeight } = useSettingsStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 注册主题和快捷键
  function handleEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor;
    
    // 注册 M3 主题
    monaco.editor.defineTheme('m3-theme', m3EditorTheme);
    monaco.editor.setTheme('m3-theme');
    
    // 注册快捷键
    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onSave);
    }
    if (onSaveInPlace) {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        onSaveInPlace
      );
    }
  }

  // 响应窗口大小变化
  useEffect(() => {
    function handleResize() {
      editorRef.current?.layout();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`h-full ${className}`}>
      <Editor
        height="100%"
        language="markdown"
        theme="m3-theme"
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorMount}
        options={{
          fontSize: editorFontSize,
          lineHeight: editorLineHeight,
          fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
          readOnly,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          folding: true,
          renderLineHighlight: 'line',
          automaticLayout: true,
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
```

### 步骤 5: 创建 Monaco Diff Viewer 组件

创建 `src/components/version/MonacoDiffViewer.tsx`：

```typescript
// src/components/version/MonacoDiffViewer.tsx
import { useRef, useEffect, useMemo } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { editor, Monaco } from 'monaco-editor';
import { m3EditorTheme } from '../editor/editorTheme';
import { diffService } from '@/services/diffService';
import { useSettingsStore } from '@/store/settingsStore';

interface MonacoDiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel?: string;
  rightLabel?: string;
  showSimilarity?: boolean;
  className?: string;
}

export default function MonacoDiffViewer({
  leftContent,
  rightContent,
  leftLabel = 'Original',
  rightLabel = 'Modified',
  showSimilarity = true,
  className = '',
}: MonacoDiffViewerProps) {
  const { editorFontSize, editorLineHeight } = useSettingsStore();
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  // 计算相似度
  const similarity = useMemo(() => {
    return diffService.computeSimilarity(leftContent, rightContent);
  }, [leftContent, rightContent]);

  // 注册主题
  function handleDiffEditorMount(diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) {
    diffEditorRef.current = diffEditor;
    
    monaco.editor.defineTheme('m3-theme', m3EditorTheme);
    monaco.editor.setTheme('m3-theme');
  }

  // 响应窗口大小变化
  useEffect(() => {
    function handleResize() {
      diffEditorRef.current?.layout();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 相似度指示器 */}
      {showSimilarity && (
        <div className="p-4 bg-surface-variant border-b border-surface-onVariant/20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">版本对比</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-onVariant">相似度:</span>
              <span className="font-bold text-primary">{similarity}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Diff 编辑器 */}
      <div className="flex-1 overflow-hidden">
        <DiffEditor
          height="100%"
          language="markdown"
          theme="m3-theme"
          original={leftContent}
          modified={rightContent}
          onMount={handleDiffEditorMount}
          options={{
            renderSideBySide: true,
            readOnly: true,
            enableSplitViewResizing: false,
            ignoreTrimWhitespace: true,
            renderOverviewRuler: true,
            fontSize: editorFontSize,
            lineHeight: editorLineHeight,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
```

### 步骤 6: 替换现有组件

#### 6.1 更新 PromptEditor.tsx

```typescript
// src/components/editor/PromptEditor.tsx
import MonacoEditor from './MonacoEditor';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSaveInPlace?: () => void;
  readOnly?: boolean;
}

export default function PromptEditor(props: PromptEditorProps) {
  return <MonacoEditor {...props} />;
}
```

#### 6.2 更新 CompareModal.tsx

```typescript
// src/components/version/CompareModal.tsx
import MonacoDiffViewer from './MonacoDiffViewer';

// ... 其他代码保持不变

// 在渲染部分替换为：
<MonacoDiffViewer
  leftContent={sourceVersion.content}
  rightContent={targetVersion.content}
  leftLabel={`版本 ${sourceVersion.id.slice(0, 8)}`}
  rightLabel={`版本 ${targetVersion.id.slice(0, 8)}`}
  showSimilarity={true}
/>
```

### 步骤 7: 移除 CodeMirror 依赖

```bash
# 卸载 CodeMirror 相关包
pnpm remove @codemirror/lang-markdown @codemirror/merge @codemirror/search @codemirror/state @codemirror/view @uiw/react-codemirror
```

### 步骤 8: 清理样式

编辑 `src/styles/globals.css`，移除 CodeMirror 相关样式：

```css
/* 删除以下部分 */
/* CodeMirror M3 主题 */
/* ... */
```

### 步骤 9: 更新 diffService

编辑 `src/services/diffService.ts`，移除 CodeMirror 导入：

```typescript
// 移除
import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';

// 保留 diff-match-patch 相关代码
import DiffMatchPatch from 'diff-match-patch';
// ...
```

---

## ✅ 验证安装

### 运行开发服务器

```bash
pnpm dev
```

### 检查清单

- [ ] 编辑器正确渲染
- [ ] Markdown 语法高亮正常
- [ ] Ctrl+F 搜索功能可用
- [ ] Ctrl+Enter 保存快捷键生效
- [ ] Ctrl+Shift+Enter 原地保存快捷键生效
- [ ] 只读模式正常工作
- [ ] 字体大小和行高设置生效
- [ ] Diff 视图正确显示差异
- [ ] 相似度统计显示正确
- [ ] 窗口大小变化时编辑器自动调整

---

## 🎨 自定义主题

### 修改颜色方案

编辑 `editorTheme.ts`，调整颜色值：

```typescript
export const m3EditorTheme: editor.IStandaloneThemeData = {
  // ...
  colors: {
    'editor.background': '#YOUR_COLOR',
    'editorCursor.foreground': '#YOUR_COLOR',
    // ...
  },
};
```

### 支持暗色主题

创建暗色主题配置：

```typescript
export const m3DarkEditorTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  // ... 暗色配置
};

// 在组件中根据系统偏好切换
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = isDark ? 'm3-dark-theme' : 'm3-theme';
```

---

## 🔧 常见配置

### 禁用缩略图

```typescript
<Editor
  options={{
    minimap: { enabled: false },
  }}
/>
```

### 启用代码折叠

```typescript
<Editor
  options={{
    folding: true,
    showFoldingControls: 'always',
  }}
/>
```

### 配置自动保存

```typescript
<Editor
  onChange={(value) => {
    onChange(value || '');
    // 防抖后自动保存
    debounce(() => autoSave(value), 1000);
  }}
/>
```

### 配置自动完成

```typescript
<Editor
  options={{
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
  }}
/>
```

---

## 🐛 常见问题

### Q1: 编辑器不显示或加载失败

**解决方案**: 检查 Vite 配置是否正确，确保 Monaco Editor 已添加到 `optimizeDeps.include`。

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
```

### Q2: 快捷键不生效

**解决方案**: 确保在 `onMount` 回调中正确注册快捷键，使用 `monaco.KeyMod` 和 `monaco.KeyCode`。

```typescript
editor.addCommand(
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
  () => console.log('Ctrl+Enter pressed')
);
```

### Q3: 主题不生效

**解决方案**: 确保主题在 `beforeMount` 或 `onMount` 中注册，并调用 `setTheme()`。

```typescript
function handleEditorMount(editor, monaco) {
  monaco.editor.defineTheme('m3-theme', m3EditorTheme);
  monaco.editor.setTheme('m3-theme');
}
```

### Q4: 编辑器高度不正确

**解决方案**: 确保父容器有明确的高度，使用 `height="100%"` 或具体数值。

```typescript
<div style={{ height: '500px' }}>
  <Editor height="100%" />
</div>
```

### Q5: 性能问题（大文件卡顿）

**解决方案**: 启用虚拟滚动，禁用不必要的功能。

```typescript
<Editor
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight: 'line', // 而非 'all'
  }}
/>
```

### Q6: TypeScript 类型错误

**解决方案**: 确保安装了正确的类型定义。

```bash
pnpm add -D @types/monaco-editor
```

并在 `tsconfig.json` 中包含：

```json
{
  "compilerOptions": {
    "types": ["monaco-editor"]
  }
}
```

---

## 📚 进一步学习

### 官方资源
- [Monaco Editor 文档](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react 文档](https://github.com/suren-atoyan/monaco-react)
- [Monaco Editor Playground](https://microsoft.github.io/monaco-editor/playground.html)

### 高级主题
- [自定义语言支持](https://microsoft.github.io/monaco-editor/monarch.html)
- [集成智能提示](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.CompletionItemProvider.html)
- [协同编辑集成](https://github.com/convergencelabs/monaco-collab-ext)

---

## 🎯 下一步

完成基础集成后，可以：

1. **编写测试**: 参考 `tests/e2e/editor-features.e2e.ts`
2. **性能优化**: 实现懒加载和代码分割
3. **功能增强**: 添加代码片段、自动完成等高级功能
4. **无障碍改进**: 确保键盘导航和屏幕阅读器支持

---

## 📝 检查清单

在完成集成前，确保：

- [ ] 所有依赖已安装
- [ ] Vite 配置正确
- [ ] 主题配置已创建
- [ ] 组件已创建并测试
- [ ] 现有组件已替换
- [ ] CodeMirror 依赖已移除
- [ ] 样式已清理
- [ ] diffService 已更新
- [ ] 所有功能正常工作
- [ ] 测试已通过
- [ ] 文档已更新

---

**祝你使用愉快！** 🎉

如有问题，请参考 [research.md](./research.md) 和 [data-model.md](./data-model.md) 获取更多技术细节。
