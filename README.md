# Prompt Studio

**🌐 直接使用 | Use it here：[prompt.hahadalin.eu.org](https://prompt.hahadalin.eu.org/)**

[English Version](#english-version) | [中文版本](#中文版本)

---

## 中文版本

### 💡 理念

Prompt Studio 是一个**本地优先**的 AI 提示词版本管理与编辑工具，致力于为 Prompt 工程师提供像管理代码一样管理提示词的能力。

我们相信：
- **版本即历史**：每次提示词的改进都应该被记录和可视化，让优化过程可追溯
- **本地优先**：您的数据属于您自己，所有内容存储在本地浏览器中，保护隐私，支持离线工作
- **直观可视**：复杂的版本树不应只是列表，而应该是一张清晰的演化地图
- **专注体验**：零配置启动，流畅的键盘操作，让工具成为思维的延伸而非障碍

### ✨ 核心功能

#### 📊 版本树可视化
- **树状结构展示**：以直观的树状图展示提示词版本的演化路径和分支关系
- **智能定位**：自动聚焦到最新修改的版本，快速找到工作重点
- **灵活导航**：平移、缩放画布，鼠标点击节点即可查看和编辑对应版本

#### ✏️ 强大的编辑器
- **基于 CodeMirror 6**：专业级代码编辑体验，支持大文本流畅编辑
- **智能保存**：`Ctrl+Enter` 创建新版本，`Ctrl+Shift+Enter` 原地更新
- **内置搜索**：支持文本搜索和正则表达式，快速定位内容
- **片段库**：保存常用文本片段，一键插入提升效率

#### 🔍 版本对比与搜索
- **并排对比**：全屏 Diff 视图，清晰标注增删改内容
- **智能去重**：自动检测重复内容，避免创建冗余版本
- **全文搜索**：在整个版本树中搜索关键词，高亮匹配结果并快速跳转

#### 🗂️ 灵活的组织方式
- **文件夹管理**：支持多层嵌套文件夹，项目分类井然有序
- **标签系统**：为项目添加模型、平台、类型标签，快速筛选
- **拖拽操作**：直观的拖拽移动项目和调整面板宽度

#### 📎 附件与备份
- **附件管理**：为版本添加图片或视频参考，支持预览和下载
- **数据导出**：导出为 JSON 或 ZIP 格式，包含完整的附件文件
- **WebDAV 同步**：配置 WebDAV 服务器实现跨设备数据备份和同步

#### 🎨 现代化 UI
- **Material Design 3**：遵循最新设计规范，清新的视觉风格
- **响应式布局**：自适应桌面、平板、移动端，随时随地工作
- **无障碍支持**：完整的键盘导航和屏幕阅读器支持，符合 WCAG 2.1 AA 标准

### 📸 应用预览

#### 主界面
![主界面](./assets/MAIN%20UI.png)

#### 差异对比
![差异对比](./assets/DIFF%20UI.png)

#### 设置界面
![设置界面](./assets/SETTINGS%20UI.png)

### 🚀 快速开始

#### 安装依赖
```bash
pnpm install
```

#### 开发模式
```bash
pnpm dev
```

#### 构建生产版本
```bash
pnpm build
```

#### 运行测试
```bash
# 单元测试和组件测试
pnpm test

# 端到端测试
pnpm test:e2e
```

### 🛠️ 技术栈

**前端框架**
- React 18 - UI 框架
- TypeScript - 类型安全
- Vite - 构建工具

**状态管理与数据**
- Zustand - 轻量级状态管理
- Dexie.js - IndexedDB 封装库
- React Router - 路由管理

**编辑器与可视化**
- CodeMirror 6 - 代码编辑器核心
- React Zoom Pan Pinch - 画布缩放和平移
- Diff Match Patch - 文本差异计算

**UI 组件**
- Tailwind CSS - 实用优先的 CSS 框架
- Headless UI - 无样式可访问组件
- Framer Motion - 动画库

**测试**
- Vitest - 单元测试和组件测试
- Playwright - 端到端测试
- Testing Library - React 组件测试

### 📄 许可证

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 许可证。

**这意味着：**
- ✅ 您可以自由使用、修改和分发本软件
- ✅ 您必须以相同的 AGPL-3.0 许可证开源您的修改版本
- ✅ 如果您通过网络提供基于本软件的服务，您必须公开完整的源代码
- ❌ 不允许将本软件用于闭源商业产品

---

## English Version

### 💡 Philosophy

Prompt Studio is a **local-first** AI prompt version management and editing tool, dedicated to empowering Prompt Engineers to manage prompts as they manage code.

We believe:
- **Versions as History**: Every prompt improvement should be recorded and visualized, making the optimization process traceable
- **Local First**: Your data belongs to you. Everything is stored locally in the browser, protecting privacy and enabling offline work
- **Intuitive Visualization**: Complex version trees should not be mere lists, but clear evolution maps
- **Focus on Experience**: Zero-configuration startup, smooth keyboard operations - let the tool become an extension of thought, not a barrier

### ✨ Core Features

#### 📊 Version Tree Visualization
- **Tree Structure Display**: Visualize prompt evolution paths and branch relationships in an intuitive tree diagram
- **Smart Positioning**: Automatically focus on the most recently modified version to quickly find your work focus
- **Flexible Navigation**: Pan and zoom the canvas, click nodes to view and edit corresponding versions

#### ✏️ Powerful Editor
- **Based on CodeMirror 6**: Professional-grade code editing experience with smooth large text editing
- **Smart Saving**: `Ctrl+Enter` to create new version, `Ctrl+Shift+Enter` to update in place
- **Built-in Search**: Support text search and regular expressions for quick content location
- **Snippet Library**: Save frequently used text snippets for one-click insertion to boost efficiency

#### 🔍 Version Comparison & Search
- **Side-by-Side Comparison**: Full-screen Diff view with clear marking of additions, deletions, and modifications
- **Smart Deduplication**: Automatically detect duplicate content to avoid creating redundant versions
- **Full-Text Search**: Search keywords across the entire version tree, highlight matches, and quickly jump between results

#### 🗂️ Flexible Organization
- **Folder Management**: Support multi-level nested folders for orderly project classification
- **Tag System**: Add model, platform, and type tags to projects for quick filtering
- **Drag & Drop**: Intuitive drag-and-drop to move projects and adjust panel widths

#### 📎 Attachments & Backup
- **Attachment Management**: Add image or video references to versions with preview and download support
- **Data Export**: Export as JSON or ZIP format with complete attachment files
- **WebDAV Sync**: Configure WebDAV server for cross-device data backup and synchronization

#### 🎨 Modern UI
- **Material Design 3**: Follow the latest design specifications with a fresh visual style
- **Responsive Layout**: Adaptive to desktop, tablet, and mobile devices for work anywhere
- **Accessibility Support**: Full keyboard navigation and screen reader support, compliant with WCAG 2.1 AA standards

### 📸 Application Preview

#### Main Interface
![Main Interface](./assets/MAIN%20UI.png)

#### Diff View
![Diff View](./assets/DIFF%20UI.png)

#### Settings
![Settings](./assets/SETTINGS%20UI.png)

### 🚀 Quick Start

#### Install Dependencies
```bash
pnpm install
```

#### Development Mode
```bash
pnpm dev
```

#### Build for Production
```bash
pnpm build
```

#### Run Tests
```bash
# Unit and component tests
pnpm test

# End-to-end tests
pnpm test:e2e
```

### 🛠️ Tech Stack

**Frontend Framework**
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool

**State Management & Data**
- Zustand - Lightweight state management
- Dexie.js - IndexedDB wrapper
- React Router - Routing

**Editor & Visualization**
- CodeMirror 6 - Code editor core
- React Zoom Pan Pinch - Canvas zoom and pan
- Diff Match Patch - Text difference calculation

**UI Components**
- Tailwind CSS - Utility-first CSS framework
- Headless UI - Unstyled accessible components
- Framer Motion - Animation library

**Testing**
- Vitest - Unit and component testing
- Playwright - End-to-end testing
- Testing Library - React component testing

### 📄 License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

**This means:**
- ✅ You are free to use, modify, and distribute this software
- ✅ You must open-source your modified versions under the same AGPL-3.0 license
- ✅ If you provide a service based on this software over a network, you must disclose the complete source code
- ❌ Using this software in closed-source commercial products is not allowed
