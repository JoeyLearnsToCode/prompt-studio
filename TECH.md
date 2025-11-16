### 技术概括方案: AI 提示词（Prompt）版本管理与编辑工具

版本: 1.0
日期: 2025年11月15日

#### 1. 整体架构与设计原则

本应用将构建为一个纯前端单页应用 (SPA)，遵循本地优先 (Local-First)的设计原则。所有业务逻辑、数据处理和存储均在客户端浏览器中完成，无需中心化后端服务器。

*   技术栈:
    *   语言: TypeScript
    *   UI 框架: React (使用 Hooks 和函数式组件)
    *   样式: TailwindCSS
    *   构建工具: Vite (提供极速的开发体验和高效的生产构建)
*   部署策略: 应用的核心是一组静态资源（HTML, CSS, JS）。为了实现跨平台部署（本地、Cloudflare Workers、Deno Deploy）且代码侵入性最小，我们将采取以下策略：
    *   核心逻辑分离: 将所有应用的核心业务逻辑（数据模型、状态管理、版本操作等）封装成与 UI 无关的纯 TS 模块。
    *   部署适配层:
        *   本地运行: Vite 内置的开发服务器直接提供服务。
        *   Cloudflare / Deno: 创建一个极简的服务器入口文件（例如 `server.ts`），其唯一职责就是响应所有请求并返回静态的 `index.html`。这样，路由交由前端的 React Router 处理。这种方式确保了不同部署环境的差异仅限于一个几十行的启动文件。

#### 2. 核心模块技术选型与实现

##### 2.1. 数据结构与状态管理

*   数据模型:
    *   扁平化设计: 所有数据（目录、项目、版本）将以扁平化的数组形式存储，通过 ID 引用（如 `parentId`, `projectId`）来关联。这种结构便于在 IndexedDB 中进行增删改查。
    *   版本 (Version) 对象:
        ```typescript
        interface Version {
          id: string; // 唯一ID (e.g., 'v_' + Date.now() + random_string)
          parentId: string | null;
          projectId: string;
          createdAt: number; // 创建时间戳
          updatedAt: number; // 更新时间戳
          content: string; // 原始文本
          normalizedContent: string; // 用于搜索和对比的标准化文本
          contentHash: string; // normalizedContent的SHA-256哈希值
          score?: number;
          attachments?: Attachment[];
        }
        ```
    *   `contentHash` 的应用:
        *   目的: 仅作为辅助字段，用于高效地进行内容去重提醒和优化 Diff 对比。绝不能用作主 `id`，以避免破坏树形结构中“位置不同但内容相同”的节点唯一性。
        *   实现: 使用如 `js-sha256` 库，在每次创建或原地更新版本时，根据 `normalizedContent` 计算并存储哈希值。
*   状态管理库:
    *   推荐: Zustand
    *   对比:
        *   Redux/RTK: 功能强大，生态成熟，但对于本项目可能过于繁琐，样板代码较多。
        *   React Context: 适用于简单场景，但在应用规模扩大、状态逻辑变复杂时，容易引发不必要的重渲染和性能问题。
        *   Zustand: 轻量、简洁，API 直观。它能很好地将业务逻辑与 UI 分离，同时避免了 Context 的性能陷阱。非常适合本项目的中等复杂度。

##### 2.2. 本地持久化存储

*   技术选型: IndexedDB
*   封装库:
    *   推荐: Dexie.js
    *   对比:
        *   原生 IndexedDB API: 异步、事件驱动，API 较为底层和繁琐，容易出错。
        *   Dexie.js: 提供了非常优美的 Promise-based API，将 IndexedDB 封装得像一个现代数据库，支持复杂的查询、索引和事务，能极大提升开发效率和代码可读性。

##### 2.3. 版本管理核心逻辑

此部分将作为独立的服务模块（例如 `versionManager.ts`）实现。

*   数据读取: 从 IndexedDB 加载指定项目的所有版本，然后在内存中根据 `parentId` 构建出树状结构用于渲染。
*   两种保存方式:
    1.  创建新版本 (`Ctrl+Enter`): 创建一个新的 `Version` 对象，设置其 `parentId` 为当前版本 `id`，并存入数据库。
    2.  原地更新 (`Ctrl+Shift+Enter`): 检查当前版本是否为叶子节点。若是，则直接修改该版本对象的 `content`, `normalizedContent`, `contentHash`, `updatedAt` 字段，并更新到数据库。
*   删除版本: 实现“接骨”逻辑。找到被删版本的所有子版本，将其 `parentId` 指向被删版本的 `parentId`，然后从数据库中删除该版本。
*   重复版本提醒: 在创建新版本时，计算出 `contentHash`，然后查询 IndexedDB 中是否存在拥有相同 `contentHash` 的其他版本。如果存在，则向用户发出提醒。

##### 2.4. 文本编辑器与对比视图

*   编辑器库: CodeMirror 6
    *   集成: 作为 React 组件进行封装。利用其模块化特性，按需加载所需的功能扩展（extension），如搜索、语言支持等。
    *   智能选择实现: 通过 CodeMirror 6 的事件监听和选区控制 API 实现。监听鼠标拖动事件，在事件回调中获取当前光标下的词法单元（word unit），并动态更新选区（`EditorSelection`）。
    *   搜索与正则: 直接使用 CodeMirror 6 内置的 `@codemirror/search` 扩展包，可以轻松实现功能完善的搜索框。
*   Diff 对比视图:
    *   推荐: `@codemirror/merge` 扩展包。
    *   实现: 这是 CodeMirror 官方提供的用于实现合并和对比视图的强大工具。它可以直接配置为并排（Side-by-Side）模式，自动计算并高亮差异，完美满足需求。

##### 2.5. 数据导入/导出与 WebDAV

*   ZIP 文件处理:
    *   推荐: JSZip
    *   实现:
        *   导出: 从 IndexedDB 读取数据和附件（Blob），使用 JSZip 在内存中构建 ZIP 结构，然后生成可供用户下载的文件。
        *   导入: 用户上传 ZIP 文件后，使用 JSZip 解压，读取其中的 `data.json` 和附件文件，然后写入 IndexedDB。
*   WebDAV 客户端:
    *   推荐: `webdav` (npm package)
    *   实现: 一个流行的、功能完整的 WebDAV 客户端库。用它来处理与用户 WebDAV 服务器的 HTTP 请求（`PUT` 用于备份，`GET` 用于还原）。
    *   CORS 问题: 必须在产品界面和文档中明确告知用户，他们的 WebDAV 服务器需要正确配置 CORS 策略，否则前端将无法直接与之通信。这是纯前端方案的固有约束。

##### 2.6. 路由管理

*   技术选型: React Router
*   实现: 用于管理应用内的页面导航，例如主视图、设置页、片段库管理页等。利用其 URL 参数功能，可以实现通过链接直接访问特定项目或版本。