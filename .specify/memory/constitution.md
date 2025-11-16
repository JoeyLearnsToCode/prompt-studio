<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: None
- Added sections: VII. 测试驱动与质量保障 (新增核心原则)
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - added testing requirements
  ✅ spec-template.md - no changes needed
  ✅ tasks-template.md - added test phase guidance
  ✅ agent-file-template.md - added testing tools
  ✅ checklist-template.md - added testing checklist items
- Follow-up TODOs: None
- Change rationale: 添加测试原则以确保代码质量和功能可靠性
-->

# Prompt Studio Constitution

## Core Principles

### I. 本地优先 (Local-First)

所有业务逻辑、数据处理和存储均在客户端浏览器中完成。应用必须：
- 零后端依赖：核心功能不依赖中心化服务器
- 本地存储：使用 IndexedDB 存储所有用户数据和附件
- 离线可用：确保应用在无网络环境下完全可用
- 数据自主：用户数据归用户所有，支持完整导入导出

**原理**: 提升数据隐私、降低部署成本、增强用户对数据的主导权。这是产品的核心设计思想，不可妥协。

### II. Material Design 3 规范 (强制)

UI/UX 设计必须严格遵循 Material Design 3 标准：
- 使用 M3 组件体系（Filled Card, Elevated Card, Segmented Button 等）
- 种子色 `rgb(207, 235, 131)` 生成完整色彩方案（Primary, Secondary, Tertiary 及其变体）
- 确保色彩对比度符合 WCAG 2.1 AA 标准
- 涟漪（Ripple）反馈和流畅过渡动画
- 响应式设计：支持桌面（> 1024px）、平板（640-1024px）、移动（< 640px）

**原理**: 统一的设计语言保证专业性、现代感和可访问性，避免设计混乱和用户体验不一致。

### III. 纯前端架构与平台无关

应用构建为纯前端单页应用（SPA），支持跨平台部署：
- 技术栈：TypeScript + React (Hooks) + TailwindCSS + Vite
- 核心逻辑分离：所有业务逻辑封装为与 UI 无关的纯 TS 模块
- 部署适配层：通过极简服务器入口文件（< 50 行）适配 Cloudflare Workers、Deno Deploy 等平台
- 静态资源优先：核心是 HTML/CSS/JS，路由由前端 React Router 处理

**原理**: 最大化可移植性和部署灵活性，降低平台绑定风险。适配层保持最小侵入性。

### IV. 扁平化数据模型

所有数据（目录、项目、版本）以扁平化数组存储，通过 ID 引用关联：
- 版本对象必需字段：`id`, `parentId`, `projectId`, `createdAt`, `updatedAt`, `content`, `normalizedContent`, `contentHash`
- `contentHash` 仅用于辅助去重和 Diff 优化，绝不作为主键
- 树形结构在内存中动态构建用于渲染
- 便于 IndexedDB 增删改查操作

**原理**: 简化数据库操作，避免嵌套结构的性能和查询复杂度问题，同时保持"位置不同但内容相同"节点的唯一性。

### V. 可访问性 (Accessibility) 第一

确保应用对所有用户可用：
- 键盘导航：所有可交互元素支持 Tab, Enter, Space, Arrow Keys 操作
- 画布缩放：支持键盘快捷键（`Ctrl +` / `Ctrl -`）和触控手势
- 屏幕阅读器：为图标按钮提供明确的 `aria-label`
- 提供"重置视图"按钮帮助迷失的用户恢复画布状态

**原理**: 可访问性不是可选项，而是专业产品的基本要求。遵循 WCAG 2.1 AA 标准。

### VI. 渐进式存储与轻量依赖

优先选择轻量、现代化的库，避免过度工程：
- 状态管理：Zustand（轻量、简洁，避免 Redux 样板代码和 Context 性能陷阱）
- IndexedDB 封装：Dexie.js（Promise-based API，提升开发效率）
- 编辑器：CodeMirror 6（模块化，按需加载扩展）
- Diff 对比：`@codemirror/merge`（官方并排对比视图）
- ZIP 处理：JSZip（导入导出附件）
- WebDAV：`webdav` npm package（备份与还原）

**原理**: 在功能和复杂度之间取得平衡，选择能解决问题的最简方案，符合 YAGNI 原则。

### VII. 测试驱动与质量保障

确保代码质量和功能可靠性，采用多层次测试策略：

**单元测试 (Unit Tests)**:
- 框架：Vitest（Vite 原生支持，极速执行）
- 覆盖范围：所有核心业务逻辑模块（versionManager, 数据模型, 工具函数）
- 测试隔离：纯函数优先，使用 mock 隔离外部依赖（IndexedDB, WebDAV）
- 最低覆盖率：关键业务逻辑达到 80%+

**组件测试 (Component Tests)**:
- 框架：React Testing Library（用户行为导向测试）
- 覆盖范围：UI 组件交互、状态变化、事件处理
- 可访问性验证：通过 aria-* 属性和语义化 HTML 进行查询

**浏览器端到端测试 (Browser E2E Tests)**:
- 工具选择策略（按优先级）：
  1. **chrome-devtools-mcp**: 如果当前开发环境提供 MCP 工具，优先使用
  2. **playwright-mcp**: 如果环境支持 Playwright MCP 集成
  3. **browser_use**: 替代自动化方案
  4. **其他可用工具**: 积极探索当前 agent 环境提供的浏览器自动化能力
- 测试场景：
  - 完整用户流程：创建项目 → 添加版本 → 编辑内容 → 保存 → 对比版本
  - 画布交互：缩放、平移、节点选择、操作按钮展开
  - IndexedDB 持久化：数据写入 → 刷新页面 → 数据恢复验证
  - 响应式布局：桌面、平板、移动端视口切换
  - 可访问性：键盘导航流程完整性
- 环境要求：真实浏览器环境，测试 Chrome/Edge（主要）+ Firefox（兼容性）

**测试执行原则**:
- 单元测试和组件测试在 CI/CD 中自动执行
- 浏览器测试在本地开发和发布前手动/自动执行
- 关键路径功能必须有浏览器测试覆盖
- 测试失败阻止代码合并

**原理**: 前端应用的复杂交互（画布操作、IndexedDB 状态管理、M3 组件行为）仅靠单元测试无法完全覆盖，浏览器测试确保真实用户体验符合预期。多工具策略适应不同开发环境，保证测试可执行性。

## 设计哲学

### 专注与无干扰

UI 设计的核心目标是让用户沉浸于提示词创作与迭代：
- 清晰的三栏布局（左侧栏、主画布、右侧面板）
- 可拖动分隔符让用户主导工作空间比例
- 可折叠侧边栏最大化工作区
- 版本对比使用全屏/接近全屏模态框以屏蔽干扰

### 可视化优先

复杂的版本历史以直观的树状图呈现：
- 从上到下的垂直排列，父子节点清晰连线
- 节点卡片显示内容摘要和元信息
- 自动定位到最新更新的版本节点
- 支持画布平移（拖动）和缩放（Ctrl+滚轮/捏合手势）

### 高效编辑体验

提供专业级编辑工具而非简单文本框：
- 智能选择：拖拽时以词/字为单元进行"吸附"选中
- 搜索功能：支持多行文本和正则表达式
- 片段库：快速插入常用 Prompt 文本块
- 两种保存方式：`Ctrl+Enter` 创建新版本，`Ctrl+Shift+Enter` 原地更新叶子节点

## 开发工作流

### 版本管理逻辑

- **创建新版本**: 生成新 `Version` 对象，设置 `parentId` 为当前版本 ID
- **原地更新**: 仅叶子节点可用，直接修改 `content`, `normalizedContent`, `contentHash`, `updatedAt`
- **删除版本**: "接骨"逻辑 - 子版本的 `parentId` 指向被删版本的 `parentId`
- **重复提醒**: 通过 `contentHash` 查询 IndexedDB 中相同哈希的版本，向用户发出提醒

### 数据操作规范

- 从 IndexedDB 读取数据后，在内存中根据 `parentId` 构建树状结构
- 使用 `js-sha256` 库计算 `contentHash`（基于 `normalizedContent`）
- 附件（Blob）存储在 IndexedDB，导出时打包进 ZIP
- WebDAV 操作需在文档中明确告知用户配置 CORS 策略

### 代码组织

- 核心业务逻辑封装为独立服务模块（如 `versionManager.ts`）
- CodeMirror 6 作为 React 组件封装，模块化加载扩展
- 使用 React Router 管理页面导航（主视图、设置页、片段库管理页等）

### 测试策略

**目录结构**:
```
tests/
├── unit/           # 单元测试（业务逻辑、工具函数）
├── component/      # 组件测试（React 组件）
└── e2e/            # 浏览器端到端测试
```

**测试命名规范**:
- 单元测试：`[模块名].test.ts`（如 `versionManager.test.ts`）
- 组件测试：`[组件名].test.tsx`（如 `VersionCard.test.tsx`）
- E2E 测试：`[用户流程].e2e.ts`（如 `version-lifecycle.e2e.ts`）

**Mock 策略**:
- IndexedDB：使用 `fake-indexeddb` 或 Vitest 内存 mock
- WebDAV 请求：使用 `msw` (Mock Service Worker) 拦截 HTTP 请求
- 浏览器 API：通过 Vitest 的 `vi.mock` 模拟（localStorage, Blob 等）

**浏览器测试执行**:
- 本地开发：`npm run test:e2e` 启动 Vite dev server + 浏览器测试
- CI/CD：使用 GitHub Actions 或类似服务，运行 headless 模式
- 测试报告：生成截图和视频（失败时）用于问题排查

## 治理 (Governance)

本章程优先于所有其他开发实践。任何偏离核心原则的决策必须：
1. 记录详细的技术理由和权衡分析
2. 在项目文档中明确标注为"例外情况"
3. 提供更简单替代方案被拒绝的原因

### 修订流程

章程修订需要：
- 明确的变更理由和影响范围分析
- 相关模板和文档的同步更新
- 版本号按语义化版本规则递增：
  - **MAJOR**: 移除或重新定义核心原则（向后不兼容）
  - **MINOR**: 新增原则或大幅扩展指导内容
  - **PATCH**: 措辞澄清、错别字修正、非语义细化

### 合规审查

所有设计决策和代码审查必须验证：
- 是否违反"本地优先"原则（引入后端依赖）
- 是否偏离 Material Design 3 规范
- 是否破坏数据模型扁平化
- 是否降低可访问性标准
- 是否引入不必要的复杂依赖
- 是否缺少必要的测试覆盖（单元测试 + 浏览器测试）

### 中文优先

所有注释、文档、提交描述均使用中文，保持项目语言一致性。

**Version**: 1.1.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
