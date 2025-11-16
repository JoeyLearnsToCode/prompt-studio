# Implementation Plan: Prompt Studio - AI 提示词版本管理与编辑工具

**Branch**: `001-prompt-studio` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-prompt-studio/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Prompt Studio 是一款本地优先的 AI 提示词版本管理与编辑工具，采用纯前端 SPA 架构。核心功能包括：可视化版本树展示、类 Git 的版本分支管理、专业级 CodeMirror 编辑器、版本对比视图、Prompt 片段库和完整的数据导入导出。所有数据存储在浏览器 IndexedDB 中，支持离线使用，无需后端服务器。技术栈采用 TypeScript + React + TailwindCSS + Vite，严格遵循 Material Design 3 规范，确保响应式布局和可访问性。

## Technical Context

**Language/Version**: TypeScript (latest stable, >= 5.0)  
**Primary Dependencies**: 
  - React 18+ (Hooks + 函数式组件)
  - TailwindCSS 3+ (M3 主题定制)
  - Vite 5+ (构建工具)
  - Zustand (状态管理)
  - Dexie.js (IndexedDB 封装)
  - CodeMirror 6 (编辑器核心)
  - @codemirror/merge (Diff 视图)
  - React Router (路由管理)
  - js-sha256 (内容哈希)
  - JSZip (ZIP 导入导出)
  - webdav (WebDAV 客户端)
  
**Storage**: IndexedDB (via Dexie.js) - 所有项目、版本、片段、附件数据  
**Testing**: 
  - Vitest + React Testing Library (unit/component)
  - fake-indexeddb (IndexedDB mock)
  - msw (HTTP mock)
  - Browser E2E: chrome-devtools-mcp / playwright-mcp / browser_use（根据环境可用性）
  
**Target Platform**: 
  - 主要：Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
  - 部署：Vite dev server (本地) / Cloudflare Workers / Deno Deploy (生产)
  
**Project Type**: Single-page web application (纯前端 SPA)

**Performance Goals**: 
  - 画布交互：60fps（缩放/平移/节点操作）
  - 编辑器加载：<200ms（版本内容切换）
  - 首次加载：<2s（正常网络环境）
  - 大数据处理：200 个版本节点流畅渲染
  
**Constraints**: 
  - 零后端依赖（本地优先原则）
  - 离线完全可用（IndexedDB 持久化）
  - WCAG 2.1 AA 可访问性标准
  - M3 色彩对比度标准
  - 单个版本文本长度：50,000 字符
  - 深层嵌套限制：20 层（虚拟滚动或限制显示）
  
**Scale/Scope**: 
  - 预期用户：个人 Prompt 工程师 + 小团队
  - 数据规模：单项目 50-200 个版本，总体 10-50 个项目
  - 附件存储：每项目 10-20 个图片/视频附件
  - 浏览器存储配额：监控并在接近限制时警告（预计 < 500MB）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **本地优先验证**: ✅ 所有功能在客户端完成（IndexedDB 存储、Zustand 状态管理、纯前端逻辑），WebDAV 为可选备份功能，无后端依赖
- [x] **Material Design 3 合规**: ✅ UI 使用种子色 rgb(207, 235, 131) 生成 M3 色彩方案，TailwindCSS 定制主题，所有组件遵循 M3 规范，色彩对比度符合 WCAG 2.1 AA
- [x] **平台无关性**: ✅ 核心业务逻辑封装为独立 TS 模块（与 UI 分离），Vite 静态构建，部署适配层仅需极简 server.ts（< 50 行）
- [x] **扁平化数据**: ✅ 所有实体（Folder, Project, Version, Snippet, Attachment）以扁平数组存储，通过 ID 引用关联（parentId, projectId, folderId），树形结构在内存中动态构建
- [x] **可访问性标准**: ✅ 所有交互元素支持键盘导航（Tab/Enter/Space/Arrow），图标按钮提供 aria-label，画布缩放支持 Ctrl+/-，屏幕阅读器友好
- [x] **轻量依赖**: ✅ Zustand（vs Redux 样板少）、Dexie.js（vs 原生 IndexedDB API 简洁）、CodeMirror 6（模块化按需加载）、所有库均符合 YAGNI 原则
- [x] **测试覆盖**: ✅ Vitest 单元测试（业务逻辑 80%+ 覆盖）、React Testing Library 组件测试、Browser E2E 测试（关键用户流程）

**Constitution Check Result**: ✅ 全部通过，无违反项

## Project Structure

### Documentation (this feature)

```text
specs/001-prompt-studio/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - 技术选型研究与最佳实践
├── data-model.md        # Phase 1 output - 数据模型设计
├── quickstart.md        # Phase 1 output - 快速开始指南
├── contracts/           # Phase 1 output - API/数据结构契约
│   ├── indexeddb-schema.md
│   └── state-management.md
├── checklists/
│   └── requirements.md  # 已完成 - 规范质量检查清单
└── spec.md              # 已完成 - 功能规范
```

### Source Code (repository root)

```text
src/
├── components/          # React 组件
│   ├── layout/          # 布局组件（Sidebar, Canvas, Panel）
│   ├── version/         # 版本相关（VersionCard, VersionTree）
│   ├── editor/          # 编辑器组件（EditorToolbar, SnippetPicker）
│   ├── common/          # 通用组件（Button, Modal, Input）
│   └── canvas/          # 画布组件（ZoomControls, PanCanvas）
├── services/            # 业务逻辑服务
│   ├── versionManager.ts      # 版本管理核心逻辑
│   ├── projectManager.ts      # 项目管理
│   ├── folderManager.ts       # 文件夹管理
│   ├── snippetManager.ts      # 片段管理
│   ├── exportService.ts       # 导入导出（JSON/ZIP）
│   └── webdavService.ts       # WebDAV 备份还原
├── store/               # Zustand 状态管理
│   ├── projectStore.ts
│   ├── versionStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── db/                  # IndexedDB 数据库
│   ├── schema.ts        # Dexie.js 数据库 schema
│   └── migrations.ts    # 数据库迁移
├── models/              # TypeScript 类型定义
│   ├── Folder.ts
│   ├── Project.ts
│   ├── Version.ts
│   ├── Snippet.ts
│   └── Attachment.ts
├── utils/               # 工具函数
│   ├── hash.ts          # SHA-256 计算（js-sha256）
│   ├── normalize.ts     # 文本标准化
│   ├── tree.ts          # 树结构构建/遍历
│   └── validation.ts    # 数据验证
├── hooks/               # 自定义 React Hooks
│   ├── useVersionTree.ts
│   ├── useCanvas.ts
│   └── useKeyboard.ts
├── pages/               # 路由页面
│   ├── MainView.tsx     # 主工作视图
│   ├── Settings.tsx     # 设置页面
│   └── SnippetLibrary.tsx  # 片段库管理
├── styles/              # 样式文件
│   ├── tailwind.config.js   # TailwindCSS 配置（M3 主题）
│   └── globals.css
├── App.tsx              # 应用根组件
├── main.tsx             # 应用入口
└── router.tsx           # React Router 配置

tests/
├── unit/                # 单元测试
│   ├── versionManager.test.ts
│   ├── projectManager.test.ts
│   ├── hash.test.ts
│   └── tree.test.ts
├── component/           # 组件测试
│   ├── VersionCard.test.tsx
│   ├── EditorToolbar.test.tsx
│   └── Canvas.test.tsx
└── e2e/                 # 浏览器端到端测试
    ├── version-lifecycle.e2e.ts
    ├── canvas-interaction.e2e.ts
    └── data-persistence.e2e.ts

public/                  # 静态资源
└── index.html

// 根目录配置文件
├── vite.config.ts       # Vite 构建配置
├── tsconfig.json        # TypeScript 配置
├── package.json         # 依赖管理
├── vitest.config.ts     # 测试配置
└── README.md            # 项目说明
```

**Structure Decision**: 

选择单页 Web 应用结构（Option 1 变体）。理由：
1. **纯前端 SPA**: 无需 backend 目录，所有逻辑在浏览器运行
2. **服务层分离**: `services/` 目录封装所有业务逻辑，与 UI 组件解耦，符合"核心逻辑分离"原则
3. **组件化**: React 组件按功能模块组织（layout/version/editor/canvas），提升可维护性
4. **状态管理**: Zustand store 独立目录，清晰的状态管理边界
5. **测试分层**: unit/component/e2e 三层测试目录对应章程测试策略

## Complexity Tracking

> **无违反项** - Constitution Check 全部通过，无需复杂度豁免
