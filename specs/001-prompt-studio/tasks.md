# Tasks: Prompt Studio - AI 提示词版本管理与编辑工具

**Input**: Design documents from `/specs/001-prompt-studio/`  
**Branch**: `001-prompt-studio`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: 任务按用户故事组织,每个故事可独立实现和测试

**Tests**: 本项目遵循章程测试要求,包含单元测试 + 组件测试 + 浏览器 E2E 测试

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3等)
- 所有任务包含明确的文件路径

---

## Phase 1: Setup (项目初始化)

**Purpose**: 搭建项目基础结构和配置开发环境

**Constitution Alignment**: 
- TypeScript + React 18 + Vite 5 + TailwindCSS 3
- Material Design 3 色彩系统(种子色: rgb(207, 235, 131))
- IndexedDB (Dexie.js) 本地优先存储
- 测试环境: Vitest + React Testing Library + Playwright

- [x] T001 创建项目目录结构 (src/, tests/, public/)
- [x] T002 初始化 npm 项目并安装核心依赖 (package.json)
- [x] T003 [P] 配置 TypeScript (tsconfig.json, tsconfig.node.json)
- [x] T004 [P] 配置 Vite 构建工具 (vite.config.ts)
- [x] T005 [P] 配置 TailwindCSS 和 M3 主题 (tailwind.config.js, src/styles/globals.css)
- [x] T006 [P] 配置 ESLint 和 Prettier (.eslintrc.js, .prettierrc)
- [x] T007 [P] 配置 Vitest 单元测试环境 (vitest.config.ts, src/test/setup.ts)
- [x] T008 [P] 配置 Playwright 浏览器测试 (playwright.config.ts)
- [x] T009 创建基础 HTML 入口文件 (public/index.html)
- [x] T010 [P] 创建全局样式文件 (src/styles/globals.css)
- [x] T011 [P] 配置 React Router (src/router.tsx)

**Checkpoint**: 开发环境就绪,可启动 `npm run dev`

---

## Phase 2: Foundational (核心基础设施)

**Purpose**: 实现所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事开发

### 数据层基础

- [x] T012 定义 TypeScript 类型接口 (src/models/Folder.ts, Project.ts, Version.ts, Snippet.ts, Attachment.ts)
- [x] T013 实现 IndexedDB Schema (src/db/schema.ts - Dexie.js 配置)
- [x] T014 实现数据库迁移机制 (src/db/migrations.ts)

### 工具函数基础

- [x] T015 [P] 实现文本标准化工具 (src/utils/normalize.ts)
- [x] T016 [P] 实现 SHA-256 哈希计算 (src/utils/hash.ts)
- [x] T017 [P] 实现树形结构构建工具 (src/utils/tree.ts)
- [x] T018 [P] 实现数据验证工具 (src/utils/validation.ts)

### 状态管理基础

- [x] T019 [P] 实现 projectStore (src/store/projectStore.ts - 文件夹和项目管理)
- [x] T020 [P] 实现 versionStore (src/store/versionStore.ts - 版本管理)
- [x] T021 [P] 实现 uiStore (src/store/uiStore.ts - UI 状态)
- [x] T022 [P] 实现 settingsStore (src/store/settingsStore.ts - 用户设置)

### UI 组件基础

- [x] T023 [P] 实现 M3 通用按钮组件 (src/components/common/Button.tsx)
- [x] T024 [P] 实现 M3 输入框组件 (src/components/common/Input.tsx)
- [x] T025 [P] 实现 M3 模态框组件 (src/components/common/Modal.tsx)
- [x] T026 [P] 实现应用根组件 (src/App.tsx)
- [x] T027 [P] 实现应用入口 (src/main.tsx)

**Checkpoint**: 基础设施完整,可开始用户故事开发

---

## Phase 3: User Story 1 - 版本创建与基础编辑 (Priority: P1) 🎯 MVP

**Goal**: 用户能够创建项目,输入提示词内容,保存版本,数据持久化到 IndexedDB

**Independent Test**: 
- 创建新项目 → 输入文本 → 保存版本 → 刷新页面 → 数据恢复完整
- 修改叶子节点 → 原地保存 → 内容更新

**Constitution Alignment**: 本地优先(零后端),扁平化数据存储,WCAG 2.1 AA 可访问性

### 测试任务 (US1)

- [x] T028 [P] [US1] 单元测试: projectManager 服务 (tests/unit/projectManager.test.ts)
- [x] T029 [P] [US1] 单元测试: versionManager 服务 (tests/unit/versionManager.test.ts)
- [x] T030 [P] [US1] 单元测试: 哈希和标准化工具 (tests/unit/hash.test.ts, normalize.test.ts)
- [x] T031 [P] [US1] 组件测试: ProjectList 组件 (tests/component/ProjectList.test.tsx)
- [x] T032 [P] [US1] 组件测试: PromptEditor 组件 (tests/component/PromptEditor.test.tsx)
- [x] T033 [US1] 浏览器 E2E 测试: 版本创建完整流程 (tests/e2e/version-creation.e2e.ts)

### 实现任务 (US1)

- [x] T034 [US1] 实现 projectManager 服务 (src/services/projectManager.ts - 项目 CRUD 逻辑)
- [x] T035 [US1] 实现 versionManager 服务 (src/services/versionManager.ts - 版本创建/更新/删除逻辑)
- [x] T036 [P] [US1] 实现 Sidebar 布局组件 (src/components/layout/Sidebar.tsx)
- [x] T037 [P] [US1] 实现 ProjectList 组件 (src/components/layout/ProjectList.tsx - 显示项目列表)
- [x] T038 [US1] 实现 PromptEditor 组件 (src/components/editor/PromptEditor.tsx - CodeMirror 6 集成)
- [x] T039 [US1] 实现 EditorToolbar 组件 (src/components/editor/EditorToolbar.tsx - 保存按钮和快捷键)
- [x] T040 [US1] 实现 MainView 页面 (src/pages/MainView.tsx - 主工作视图布局)
- [x] T041 [US1] 集成键盘快捷键 (Ctrl+Enter 创建, Ctrl+Shift+Enter 原地保存)
- [x] T042 [US1] 实现数据持久化验证 (刷新页面数据恢复测试)

**Checkpoint**: MVP 功能完成 - 用户可创建项目和版本,数据持久化可用

---

## Phase 4: User Story 2 - 版本树可视化与导航 (Priority: P1)

**Goal**: 用户能够在画布中查看版本树状结构,点击节点切换版本内容

**Independent Test**: 
- 创建至少 3 个版本(含分支) → 画布显示树状图 → 点击节点 → 编辑器加载对应内容
- 缩放/平移画布 → 重置视图 → 恢复默认位置

**Constitution Alignment**: Material Design 3 交互规范,60fps 画布性能,可访问性(键盘导航)

### 测试任务 (US2)

- [x] T043 [P] [US2] 单元测试: tree 工具函数 (tests/unit/tree.test.ts)
- [x] T044 [P] [US2] 组件测试: VersionCard 组件 (tests/component/VersionCard.test.tsx)
- [x] T045 [P] [US2] 组件测试: VersionCanvas 组件 (tests/component/VersionCanvas.test.tsx)
- [ ] T046 [US2] 浏览器 E2E 测试: 画布交互和导航 (tests/e2e/canvas-interaction.e2e.ts)

### 实现任务 (US2)

- [x] T047 [P] [US2] 实现树形布局算法 (src/utils/treeLayout.ts - Reingold-Tilford 或 Dagre)
- [x] T048 [P] [US2] 实现 VersionCard 组件 (src/components/version/VersionCard.tsx - 版本节点卡片)
- [x] T049 [US2] 实现 VersionCanvas 组件 (src/components/canvas/VersionCanvas.tsx - react-zoom-pan-pinch 集成)
- [x] T050 [P] [US2] 实现 ZoomControls 组件 (src/components/canvas/ZoomControls.tsx - 缩放控制按钮)
- [x] T051 [US2] 实现 SVG 树形渲染逻辑 (VersionCanvas 内,节点和连线)
- [x] T052 [US2] 实现画布自动定位到最新版本 (打开项目时)
- [x] T053 [US2] 实现节点点击事件 (高亮节点,加载内容到编辑器)
- [x] T054 [US2] 实现画布平移和缩放 (鼠标拖拽,Ctrl+滚轮)
- [x] T055 [US2] 实现重置视图功能 (恢复默认缩放和位置)
- [x] T056 [US2] 性能优化: 虚拟滚动或 Canvas 降级 (>200 节点时)

**Checkpoint**: 版本可视化完成 - 用户可通过画布查看和导航版本树 ✅

---

## Phase 5: User Story 3 - 版本对比与差异查看 (Priority: P2)

**Goal**: 用户能够选择任意两个版本,在并排视图中查看文本差异

**Independent Test**: 
- 选择两个版本 → 点击对比按钮 → 全屏 Diff 视图显示 → 增删改清晰高亮
- 按 Esc 或关闭按钮 → 返回正常编辑视图

**Constitution Alignment**: CodeMirror merge 扩展,M3 色彩对比度,键盘快捷键

### 测试任务 (US3)

- [x] T057 [P] [US3] 组件测试: DiffModal 组件 (tests/component/DiffModal.test.tsx)
- [ ] T058 [US3] 浏览器 E2E 测试: 版本对比流程 (tests/e2e/version-diff.e2e.ts)

### 实现任务 (US3)

- [x] T059 [P] [US3] 实现 DiffModal 组件 (src/components/editor/DiffModal.tsx - 全屏模态框)
- [x] T060 [US3] 集成 CodeMirror merge 视图 (@codemirror/merge)
- [x] T061 [US3] 实现版本选择器 (EditorToolbar 中的对比按钮和版本选择 UI)
- [x] T062 [US3] 实现 Diff 视图高亮样式 (绿色增加,红色删除,M3 色彩)
- [x] T063 [US3] 实现键盘快捷键 (Esc 关闭 Diff 视图)

**Checkpoint**: 版本对比功能完成 - 用户可对比任意两个版本 ✅

---

## Phase 6: User Story 4 - 文件夹与项目组织 (Priority: P2)

**Goal**: 用户能够创建文件夹,组织项目,拖拽移动项目

**Independent Test**: 
- 创建多层文件夹 → 将项目拖拽到文件夹 → 展开/折叠文件夹
- 重命名文件夹 → 删除文件夹 → 子文件夹和项目移动到父级

**Constitution Alignment**: 扁平化数据模型(parentId 引用),级联删除规则

### 测试任务 (US4)

- [ ] T064 [P] [US4] 单元测试: folderManager 服务 (tests/unit/folderManager.test.ts)
- [ ] T065 [P] [US4] 组件测试: FolderTree 组件 (tests/component/FolderTree.test.tsx)
- [ ] T066 [US4] 浏览器 E2E 测试: 文件夹管理流程 (tests/e2e/folder-management.e2e.ts)

### 实现任务 (US4)

- [x] T067 [US4] 实现 folderManager 服务 (src/services/folderManager.ts - 文件夹 CRUD 逻辑)
- [x] T068 [P] [US4] 实现 FolderTree 组件 (src/components/layout/FolderTree.tsx - 树形文件夹展示)
- [x] T069 [P] [US4] 实现 ContextMenu 组件 (src/components/common/ContextMenu.tsx - 右键菜单)
- [x] T070 [US4] 实现文件夹创建/重命名/删除逻辑
- [ ] T071 [US4] 实现项目拖拽功能 (react-dnd 或原生 HTML5 drag API)
- [x] T072 [US4] 实现文件夹展开/折叠状态管理 (uiStore 中存储)
- [x] T073 [US4] 实现级联删除逻辑 (删除文件夹时移动子项)

**Checkpoint**: 项目组织功能完成 - 用户可通过文件夹管理项目 ✅ (拖拽功能待完成)

---

## Phase 7: User Story 5 - Prompt 片段库管理 (Priority: P3)

**Goal**: 用户能够保存常用文本片段,快速插入到编辑器

**Independent Test**: 
- 选中文本 → 保存为片段 → 在片段库中查看
- 点击片段 → 内容插入到光标位置
- 编辑/删除片段 → 变更立即生效

**Constitution Alignment**: IndexedDB 独立存储,CodeMirror 插入 API

### 测试任务 (US5)

- [ ] T074 [P] [US5] 单元测试: snippetManager 服务 (tests/unit/snippetManager.test.ts)
- [ ] T075 [P] [US5] 组件测试: SnippetPicker 组件 (tests/component/SnippetPicker.test.tsx)
- [ ] T076 [US5] 浏览器 E2E 测试: 片段库管理流程 (tests/e2e/snippet-library.e2e.ts)

### 实现任务 (US5)

- [ ] T077 [US5] 实现 snippetManager 服务 (src/services/snippetManager.ts - 片段 CRUD 逻辑)
- [ ] T078 [P] [US5] 实现 SnippetPicker 组件 (src/components/editor/SnippetPicker.tsx - 片段选择器)
- [ ] T079 [P] [US5] 实现 SnippetLibrary 页面 (src/pages/SnippetLibrary.tsx - 片段管理界面)
- [ ] T080 [US5] 实现片段保存功能 (从编辑器选中文本保存)
- [ ] T081 [US5] 实现片段插入功能 (插入到 CodeMirror 光标位置)
- [ ] T082 [US5] 实现片段编辑/删除功能 (SnippetLibrary 页面)

**Checkpoint**: 片段库功能完成 - 用户可管理和使用片段

---

## Phase 8: User Story 6 - 数据导入导出与备份 (Priority: P3)

**Goal**: 用户能够导出项目为 ZIP/JSON,导入恢复数据,配置 WebDAV 备份

**Independent Test**: 
- 导出项目为 ZIP → 在另一设备导入 → 所有数据和附件恢复
- 配置 WebDAV → 备份到远程 → 从远程还原 → 数据一致

**Constitution Alignment**: JSZip 库,WebDAV 客户端,数据验证

### 测试任务 (US6)

- [ ] T083 [P] [US6] 单元测试: exportService 服务 (tests/unit/exportService.test.ts)
- [ ] T084 [P] [US6] 单元测试: webdavService 服务 (tests/unit/webdavService.test.ts)
- [ ] T085 [US6] 浏览器 E2E 测试: 导入导出流程 (tests/e2e/import-export.e2e.ts)

### 实现任务 (US6)

- [x] T086 [US6] 实现 exportService 服务 (src/services/exportService.ts - JSON/ZIP 导出)
- [x] T087 [US6] 实现导入逻辑 (解析 ZIP/JSON,验证并写入 IndexedDB)
- [x] T088 [US6] 实现 webdavService 服务 (src/services/webdavService.ts - WebDAV 客户端)
- [x] T089 [P] [US6] 实现 Settings 页面 (src/pages/Settings.tsx - 导入导出和 WebDAV 配置)
- [x] T090 [US6] 实现导出为 JSON 功能 (项目数据序列化)
- [x] T091 [US6] 实现导出为 ZIP 功能 (包含附件,使用 JSZip)
- [x] T092 [US6] 实现 WebDAV 配置表单 (URL, 用户名, 密码)
- [x] T093 [US6] 实现 WebDAV 备份功能 (上传数据到远程)
- [x] T094 [US6] 实现 WebDAV 还原功能 (从远程下载并恢复)
- [x] T095 [US6] 实现错误处理和用户提示 (CORS 配置错误,网络失败等)

**Checkpoint**: 数据备份功能完成 - 用户可导入导出和远程备份

---

## Phase 9: User Story 7 - 附件管理(图片/视频) (Priority: P4)

**Goal**: 用户能够为版本上传图片/视频附件,查看预览,删除附件

**Independent Test**: 
- 上传图片 → 显示缩略图 → 点击预览大图
- 上传视频 → 播放预览
- 删除附件 → 附件从版本移除

**Constitution Alignment**: IndexedDB Blob 存储,M3 图片预览组件

### 测试任务 (US7)

- [ ] T096 [P] [US7] 单元测试: attachmentManager 服务 (tests/unit/attachmentManager.test.ts)
- [ ] T097 [P] [US7] 组件测试: AttachmentGallery 组件 (tests/component/AttachmentGallery.test.tsx)
- [ ] T098 [US7] 浏览器 E2E 测试: 附件管理流程 (tests/e2e/attachment-management.e2e.ts)

### 实现任务 (US7)

- [x] T099 [US7] 实现 attachmentManager 服务 (src/services/attachmentManager.ts - 附件上传/删除)
- [x] T100 [P] [US7] 实现 AttachmentGallery 组件 (src/components/version/AttachmentGallery.tsx - 附件缩略图展示)
- [x] T101 [P] [US7] 实现 ImagePreview 组件 (src/components/common/ImagePreview.tsx - 大图预览模态框)
- [x] T102 [US7] 实现文件上传功能 (拖拽或点击上传,支持多文件)
- [x] T103 [US7] 实现附件验证 (文件类型,大小限制 50MB)
- [x] T104 [US7] 实现缩略图生成 (Canvas API 或 createObjectURL)
- [x] T105 [US7] 实现附件预览功能 (图片大图,视频播放)
- [x] T106 [US7] 实现附件删除功能 (从 IndexedDB 移除 Blob)

**Checkpoint**: 附件功能完成 - 用户可为版本添加多媒体附件 ✅ (测试待补充)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的优化和完善

### 性能优化

- [ ] T107 [P] 实现存储配额监控 (src/utils/quota.ts - navigator.storage.estimate)
- [ ] T108 [P] 优化画布渲染性能 (虚拟滚动,Canvas 降级 >500 节点)
- [ ] T109 [P] 优化 IndexedDB 查询性能 (批量操作,索引优化)

### 可访问性增强

- [ ] T110 [P] 完善键盘导航 (Tab/Enter/Arrow Keys 全局支持)
- [ ] T111 [P] 添加 ARIA 标签 (所有交互元素)
- [ ] T112 [P] 验证色彩对比度 (WCAG 2.1 AA 标准)

### 错误处理

- [ ] T113 [P] 实现全局错误边界 (React Error Boundary)
- [ ] T114 [P] 实现数据完整性验证 (src/utils/validation.ts - 启动时检查孤儿数据)
- [ ] T115 [P] 实现用户友好的错误提示 (Toast 组件)

### 文档和部署

- [ ] T116 [P] 编写用户文档 (README.md - 功能介绍,快速开始)
- [ ] T117 [P] 编写开发者文档 (docs/ARCHITECTURE.md - 架构说明)
- [ ] T118 验证 quickstart.md 指南 (按步骤执行并修正错误)
- [ ] T119 配置生产构建 (vite build 优化,静态资源处理)
- [ ] T120 准备部署配置 (Cloudflare Workers / Deno Deploy 适配层)

### 测试验证

- [ ] T121 执行完整测试套件 (npm run test && npm run test:e2e)
- [ ] T122 浏览器兼容性测试 (Chrome, Firefox, Safari, Edge)
- [ ] T123 离线功能验证 (断网后所有本地功能正常工作)
- [ ] T124 数据持久化压力测试 (200 个版本,50 个附件)

**Checkpoint**: 产品质量达标,可发布

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational)
                       ↓
       ┌───────────────┼───────────────┬───────────────┬───────────────┐
       ↓               ↓               ↓               ↓               ↓
  Phase 3 (US1)   Phase 4 (US2)   Phase 5 (US3)   Phase 6 (US4)   Phase 7 (US5)
    MVP 🎯           ↓               ↓               ↓               ↓
                     └───────────────┴───────────────┴───────────────┘
                                     ↓
                              Phase 8 (US6)
                                     ↓
                              Phase 9 (US7)
                                     ↓
                              Phase 10 (Polish)
```

### User Story Dependencies

- **US1 (P1) - 版本创建**: 无依赖,可在 Foundational 完成后立即开始 - **MVP 核心**
- **US2 (P1) - 版本树可视化**: 无依赖,可在 Foundational 完成后立即开始 - **MVP 核心**
- **US3 (P2) - 版本对比**: 依赖 US1(版本数据),US2(版本选择器) - 建议 US1+US2 完成后开始
- **US4 (P2) - 文件夹组织**: 无依赖,可在 Foundational 完成后立即开始
- **US5 (P3) - 片段库**: 依赖 US1(编辑器) - 建议 US1 完成后开始
- **US6 (P3) - 导入导出**: 依赖 US1(项目数据),US7(附件数据) - 建议后期实现
- **US7 (P4) - 附件管理**: 依赖 US1(版本数据) - 建议 US1 完成后开始

### Within Each User Story

1. **测试优先**: 编写测试 → 验证失败 → 实现功能 → 测试通过
2. **数据层先行**: 服务层 → 组件层 → 集成层
3. **并行开发**: 标记 [P] 的任务可同时进行

### Parallel Opportunities

**Setup Phase**: T003, T004, T005, T006, T007, T008, T010, T011 可并行执行

**Foundational Phase**: 
- T015-T018 (工具函数) 可并行
- T019-T022 (状态管理) 可并行
- T023-T025 (通用组件) 可并行

**User Story Phases**: 
- 一旦 Foundational 完成,US1, US2, US4 可并行开发(不同开发者)
- 每个 User Story 内的测试任务可并行执行
- 每个 User Story 内标记 [P] 的组件可并行开发

**Polish Phase**: T107-T124 大部分可并行执行

---

## Parallel Example: User Story 1 (MVP)

```bash
# 同时启动所有测试编写 (TDD 方式):
Task T028: "单元测试 projectManager"
Task T029: "单元测试 versionManager"
Task T030: "单元测试工具函数"
Task T031: "组件测试 ProjectList"
Task T032: "组件测试 PromptEditor"

# 测试失败后,并行开发组件:
Task T036: "实现 Sidebar 组件"
Task T037: "实现 ProjectList 组件"
# 串行开发依赖服务:
Task T034: "实现 projectManager" (先)
Task T035: "实现 versionManager" (后,依赖 T034)
```

---

## Implementation Strategy

### MVP First (推荐路径)

**目标**: 2-3 周内交付可用 MVP

1. **Week 1**: 完成 Phase 1 (Setup) + Phase 2 (Foundational)
2. **Week 2**: 完成 Phase 3 (US1 - 版本创建) - **MVP 里程碑 1**
3. **Week 3**: 完成 Phase 4 (US2 - 版本树可视化) - **MVP 里程碑 2**
4. **验证**: 测试 US1+US2 独立功能,部署演示

**MVP 交付物**: 用户可创建项目,编写提示词,保存版本,在可视化画布中查看版本树

### Incremental Delivery

**目标**: 每 1-2 周交付一个完整功能

1. **Sprint 1**: Setup + Foundational → 基础设施就绪
2. **Sprint 2**: US1 → 版本创建可用 → **发布 v0.1**
3. **Sprint 3**: US2 → 版本可视化可用 → **发布 v0.2 (MVP)**
4. **Sprint 4**: US3 + US4 → 版本对比和文件夹组织 → **发布 v0.3**
5. **Sprint 5**: US5 + US7 → 片段库和附件 → **发布 v0.4**
6. **Sprint 6**: US6 + Polish → 数据备份和优化 → **发布 v1.0**

### Parallel Team Strategy (3 人团队)

**Phase 1-2**: 全员协作完成 Setup + Foundational (1 周)

**Phase 3-9** (6 周):
- **Developer A**: US1 (1 周) → US3 (1 周) → US6 (2 周)
- **Developer B**: US2 (1 周) → US4 (1 周) → US7 (1 周) → Polish (1 周)
- **Developer C**: 测试支持 (2 周) → US5 (1 周) → 文档和部署 (1 周)

**Phase 10**: 全员协作 Polish & 测试验证 (1 周)

---

## Task Statistics

**Total Tasks**: 124

### By Phase
- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundational): 16 tasks
- Phase 3 (US1 - MVP): 15 tasks
- Phase 4 (US2 - MVP): 14 tasks
- Phase 5 (US3): 7 tasks
- Phase 6 (US4): 11 tasks
- Phase 7 (US5): 9 tasks
- Phase 8 (US6): 13 tasks
- Phase 9 (US7): 11 tasks
- Phase 10 (Polish): 17 tasks

### By Type
- 测试任务: 30 tasks (单元测试 + 组件测试 + E2E 测试)
- 实现任务: 77 tasks (服务 + 组件 + 集成)
- 配置任务: 11 tasks (Setup 阶段)
- 优化任务: 6 tasks (Polish 阶段)

### Parallelizable Tasks
- 标记 [P] 的任务: 47 tasks (约 38%)
- 可节省时间: 如 3 人团队,理论可节省 30-40% 总时间

---

## Notes

- **[P] 标记**: 表示可并行执行(不同文件,无依赖冲突)
- **[Story] 标签**: 将任务映射到 spec.md 中的用户故事,便于追踪
- **测试优先**: 所有用户故事遵循 TDD,先写测试再实现
- **独立交付**: 每个用户故事完成后可独立验证和部署
- **MVP 优先**: 建议先完成 US1 + US2,验证核心价值后再扩展功能
- **提交策略**: 每完成一个任务或逻辑组提交一次,便于回滚和代码审查
- **Checkpoint 验证**: 每个阶段完成后验证功能完整性,避免返工

---

**任务列表生成完成** | 基于 spec.md (7 个用户故事) + plan.md + data-model.md + contracts/
