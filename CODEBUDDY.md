# Prompt Studio Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-18

## Active Technologies

**Core Stack**: TypeScript + React (Hooks) + TailwindCSS + Vite
**State Management**: Zustand
**Storage**: IndexedDB (Dexie.js)
**Editor**: Monaco Editor (replacing CodeMirror 6) with @monaco-editor/react
**Utilities**: JSZip, webdav, js-sha256
**Router**: React Router
**Design System**: Material Design 3 (种子色: rgb(207, 235, 131))
**Testing**: 
  - Unit/Component: Vitest + React Testing Library
  - Mocking: fake-indexeddb, msw (Mock Service Worker)
  - Browser E2E: chrome-devtools-mcp / playwright-mcp / browser_use (根据环境可用性选择)

- TypeScript 5.3.3 + React 18.2.0 (Hooks), TailwindCSS 3.4.0, Vite 5.0.8 (003-monaco-editor)
- Monaco Editor + @monaco-editor/react (003-monaco-editor) - 替换 CodeMirror，提升视觉体验

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

**TypeScript**:
- 使用函数式组件和 React Hooks
- 严格类型定义，避免 `any`
- 接口命名遵循领域模型（Version, Project, Folder）

**React**:
- 组件文件使用 PascalCase
- 服务/工具模块使用 camelCase
- Props 解构，明确类型

**样式**:
- TailwindCSS 优先，避免内联样式
- M3 组件类名遵循设计规范
- 响应式断点：sm (640px), md (768px), lg (1024px)

**测试**:
- 单元测试文件：`[模块名].test.ts`
- 组件测试文件：`[组件名].test.tsx`
- E2E 测试文件：`[流程名].e2e.ts`
- 测试目录：`tests/unit/`, `tests/component/`, `tests/e2e/`
- 覆盖率要求：核心业务逻辑 80%+

**注释与文档**:
- 所有注释使用中文
- 复杂逻辑必须注释原理
- 公共 API 提供 JSDoc

TypeScript 5.3.3: Follow standard conventions

## Recent Changes

- 003-monaco-editor: Added TypeScript 5.3.3 + React 18.2.0 (Hooks), TailwindCSS 3.4.0, Vite 5.0.8
- 003-monaco-editor: 替换编辑器为 Monaco Editor，移除 CodeMirror 依赖，提升 UI 现代感
- 003-monaco-editor: 添加 M3 主题配置，支持 Markdown 语法高亮和 Diff 对比视图

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
