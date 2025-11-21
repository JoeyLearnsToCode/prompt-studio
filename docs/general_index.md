# Prompt Studio 代码库索引

Prompt Studio 是一个AI提示词版本管理与编辑工具，以下是其代码库的结构和文件说明。

## 根目录

| 文件/目录 | 说明 |
|-----------|------|
| `README.md` | 项目介绍文档，包含中英文双语说明 |
| `LICENSE` | 开源许可证文件（AGPL-3.0） |
| `index.html` | 应用程序的HTML入口文件 |
| `package.json` | 项目配置和依赖管理文件 |
| `pnpm-lock.yaml` | 锁定依赖版本文件 |
| `tsconfig.json` | TypeScript配置文件 |
| `tsconfig.node.json` | Node环境的TypeScript配置 |
| `vite.config.ts` | Vite构建工具配置 |
| `vitest.config.ts` | Vitest测试框架配置 |
| `playwright.config.ts` | Playwright端到端测试配置 |
| `postcss.config.js` | PostCSS配置文件 |
| `tailwind.config.js` | Tailwind CSS配置文件 |
| `test-manual.html` | 手动测试页面 |
| `.eslintrc.cjs` | ESLint代码检查配置 |
| `.prettierrc` | Prettier代码格式化配置 |
| `docs/` | 项目文档目录 |
| `specs/` | 项目规格说明目录 |
| `src/` | 源代码目录 |
| `tests/` | 测试文件目录 |

## src: 源代码主目录

```
src/
|-- App.tsx: 应用程序主组件，包含路由配置
|-- main.tsx: 应用程序入口文件，初始化数据库并渲染App组件
|-- router.tsx: 应用程序路由配置，定义页面路径
|-- components/: React组件目录
|   |-- canvas/: 画布相关组件
|   |   |-- SearchBar.tsx: 画布搜索栏组件，提供版本搜索功能
|   |   |-- VersionCanvas.tsx: 版本画布组件，显示版本关系的可视化
|   |-- common/: 通用组件
|   |   |-- Button.tsx: 通用按钮组件
|   |   |-- ContextMenu.tsx: 右键上下文菜单组件
|   |   |-- DuplicateDialog.tsx: 复制对话框组件
|   |   |-- ImagePreview.tsx: 图片预览组件
|   |   |-- Input.tsx: 通用输入框组件
|   |   |-- Modal.tsx: 通用模态框组件
|   |   |-- ResizableSplitter.tsx: 可调整大小的分割面板组件
|   |-- editor/: 编辑器相关组件
|   |   |-- EditorToolbar.tsx: 编辑器工具栏组件
|   |   |-- PromptEditor.tsx: 提示词编辑器组件
|   |   |-- SearchPanelUI.tsx: 编辑器搜索面板组件，支持查找、替换、正则表达式等功能
|   |-- layout/: 布局相关组件
|   |   |-- FolderTree.tsx: 文件夹树形结构组件
|   |   |-- ProjectList.tsx: 项目列表组件
|   |   |-- Sidebar.tsx: 侧边栏组件
|   |-- version/: 版本相关组件
|   |   |-- AttachmentGallery.tsx: 附件画廊组件，支持图片/视频上传、预览、下载
|   |   |-- CompareModal.tsx: 版本比较模态框组件
|   |   |-- VersionCard.tsx: 版本卡片组件
|-- contexts/: React上下文目录
|-- db/: 数据库相关
|   |-- migrations.ts: 数据库迁移脚本
|   |-- schema.ts: 数据库模式定义
|-- hooks/: 自定义React Hooks
|   |-- useVersionCompare.ts: 版本比较Hook
|   |-- useVersionSearch.ts: 版本搜索Hook
|-- models/: 数据模型定义
|   |-- Attachment.ts: 附件数据模型
|   |-- Folder.ts: 文件夹数据模型
|   |-- Project.ts: 项目数据模型
|   |-- Snippet.ts: 代码片段数据模型
|   |-- Version.ts: 版本数据模型（normalizedContent 字段为运行时计算，不保存到数据库）
|-- pages/: 页面组件
|   |-- MainView.tsx: 主视图页面
|   |-- Settings.tsx: 设置页面
|   |-- SnippetLibrary.tsx: 代码片段库页面
|-- services/: 业务逻辑服务
|   |-- attachmentManager.ts: 附件管理服务
|   |-- canvasInteraction.ts: 画布交互服务
|   |-- canvasRenderer.ts: 画布渲染服务
|   |-- diffService.ts: 差异计算服务
|   |-- exportService.ts: 导入导出功能服务（支持 JSON 和 ZIP 格式，导出时自动清理运行时字段）
|   |-- folderManager.ts: 文件夹管理服务
|   |-- layoutManager.ts: 布局管理服务，管理画布宽度和编辑器高度比例
|   |-- projectManager.ts: 项目管理服务
|   |-- searchService.ts: 搜索功能服务
|   |-- snippetManager.ts: 代码片段管理服务
|   |-- versionManager.ts: 版本管理服务
|   |-- webdavService.ts: WebDAV同步服务
|-- store/: 状态管理
|   |-- projectStore.ts: 项目状态管理
|   |-- searchStore.ts: 搜索状态管理
|   |-- settingsStore.ts: 设置状态管理
|   |-- uiStore.ts: UI状态管理，包括布局偏好、折叠状态等
|   |-- versionStore.ts: 版本状态管理
|-- styles/: 样式文件
|   |-- globals.css: 全局样式文件，包含Material Design 3主题和Tailwind CSS配置
|-- test/: 测试相关
|   |-- setup.ts: 测试环境设置
|-- utils/: 工具函数
|   |-- hash.ts: 哈希计算工具
|   |-- normalize.ts: 数据标准化工具
|   |-- storage.ts: 本地存储工具，提供布局偏好等配置的持久化
|   |-- tree.ts: 树形结构操作工具
|   |-- treeLayout.ts: 树形布局计算工具
|   |-- validation.ts: 数据验证工具
```

## tests: 测试目录

```
tests/
|-- component/: 组件测试

|   |-- ProjectList.test.tsx: 项目列表组件测试
|   |-- PromptEditor.test.tsx: 提示词编辑器组件测试
|   |-- VersionCanvas.test.tsx: 版本画布组件测试
|   |-- VersionCard.test.tsx: 版本卡片组件测试
|-- e2e/: 端到端测试
|   |-- canvas-interaction.e2e.ts: 画布交互端到端测试
|   |-- version-creation.e2e.ts: 版本创建端到端测试
|   |-- version-tree-navigation.e2e.ts: 版本树导航端到端测试
|-- unit/: 单元测试
|   |-- hash.test.ts: 哈希函数单元测试
|   |-- normalize.test.ts: 标准化函数单元测试
|   |-- projectManager.test.ts: 项目管理器单元测试
|   |-- tree.test.ts: 树形结构操作单元测试
|   |-- versionManager.test.ts: 版本管理器单元测试
```

## docs: 文档目录

docs目录包含项目的各种文档资料，用于帮助开发者和用户理解和使用Prompt Studio。