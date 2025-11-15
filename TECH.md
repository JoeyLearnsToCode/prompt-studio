### 技术概括文档: AI 提示词（Prompt）版本管理与编辑工具

版本: 1.0
日期: 2025年11月15日

#### 1. 整体架构与设计哲学

*   架构模式: 纯前端、本地优先 (Local-First)。
    *   Rationale: 应用的核心逻辑完全在浏览器端运行，不依赖任何后端服务器。这确保了最高级别的用户数据隐私、零服务器成本、天生的离线可用性，并简化了部署。
*   数据流: 用户的所有数据（项目、版本、附件）均通过 `IndexedDB` 存储在用户本地的浏览器中。数据导入/导出和 WebDAV 备份是用户自主控制数据迁移的方式。
*   部署目标: 应用将被构建为一套纯静态资源（HTML, CSS, JS）。
    *   Rationale: 这种方式具备最佳的可移植性。构建出的静态文件夹可以无缝部署到任何静态托管平台，包括 Cloudflare Pages (专为静态网站设计) 和 Deno Deploy，实现了代码逻辑的 100% 复用，无任何平台侵入性代码。

#### 2. 核心技术栈选型

*   UI 框架: React (with TypeScript)
    *   Rationale: 行业标准，组件化思想非常适合构建复杂 UI。TypeScript 提供类型安全，能极大提升大型项目的可维护性。
*   状态管理:
    *   选项 1 (推荐): Zustand: 一个轻量、快速、无模板的 React 状态管理库。对于本项目，其简单直观的 API 足以管理全局状态（如当前项目、目录树）和复杂的本地状态，避免了 Redux 的复杂性。
    *   选项 2: Redux Toolkit: 功能更强大、规则更严格，适合超大型或多人协作的项目。本项目初期可考虑 Zustand，以提升开发效率。
*   样式方案: TailwindCSS
    *   Rationale: 原子化 CSS 框架，能快速构建美观且一致的 UI，非常适合快速迭代。
*   编辑器核心: CodeMirror 6
    *   Rationale: 高度模块化和可扩展。相比 Monaco，它更轻量，更适合通过组合扩展来精确实现所需功能，完全满足“高级搜索”和“智能选择”的定制需求。
*   本地数据库: Dexie.js
    *   Rationale: 这是 IndexedDB 的一个优秀封装库。它提供了非常友好的 Promise-based API，让复杂的 IndexedDB 操作（如事务、索引查询）变得极其简单，是 React 应用与 IndexedDB 交互的首选。
*   ZIP 处理: JSZip
    *   Rationale: 社区公认的标准库，用于在 JavaScript 中创建、读取和编辑 `.zip` 文件，功能稳定且文档齐全。
*   哈希计算: js-sha256
    *   Rationale: 一个轻量、独立的 SHA256 哈希计算库，用于生成 `contentHash`。
*   WebDAV 客户端: webdav
    *   Rationale: 一个功能完整的 WebDAV 客户端库，支持 Node.js 和浏览器。需要重点处理其与目标服务器的 CORS (跨源资源共享) 策略兼容性问题。

#### 3. 数据建模与持久化

所有数据将存储在 IndexedDB 中，通过 Dexie.js 进行管理。

*   数据库表 (Object Stores):
    1.  `projects`: 存储所有项目的元数据。
    2.  `versions`: 扁平化存储所有项目的全部版本。
    3.  `snippets`: 存储用户的 Prompt 片段。

*   核心数据接口 (TypeScript Interfaces):

    ```typescript
    interface Project {
      id: string; // 唯一ID, e.g., using nanoid
      name: string;
      folderId: string | null; // 所属目录ID
      tags: { model?: string; platform?: string; type?: string; };
      createdAt: number; // Timestamp
      updatedAt: number; // Timestamp
    }

    interface Version {
      id: string; // 唯一ID, e.g., 'ver_' + Date.now() + Math.random()
      projectId: string; // 所属项目ID
      parentId: string | null; // 父版本ID，根版本为 null
      content: string;
      normalizedContent: string; // 用于搜索和对比的标准化内容
      contentHash: string; // a SHA256 hash of normalizedContent
      score?: number;
      attachments?: { id: string; type: 'image' | 'video'; data: Blob };
      createdAt: number; // Timestamp
      updatedAt: number; // Timestamp for in-place edits
    }
    ```

#### 4. 核心功能实现方案

##### 4.1. 版本与分支管理

*   数据结构: 采用扁平化数组存储所有 `Version` 对象，通过 `parentId` 在运行时动态构建树形关系。这是性能最高且最易于查询和维护的方式。
*   编辑与保存逻辑:
    1.  默认保存 (`Ctrl+Enter`):
        *   创建一个全新的 `Version` 对象。
        *   设置其 `parentId` 为当前编辑版本的 `id`。
        *   计算新内容的 `normalizedContent` 和 `contentHash`。
        *   将新对象存入 IndexedDB。
    2.  原地保存 (`Ctrl+Shift+Enter`):
        *   前置检查: 确认当前版本是叶子节点（即查询数据库中没有任何版本的 `parentId` 是当前版本的 `id`）。
        *   执行更新: 若是，则直接更新当前 `Version` 对象的 `content`, `normalizedContent`, `contentHash`, 和 `updatedAt` 字段。
*   版本删除:
    *   当删除 ID 为 `D` 的版本时，执行一个事务：
        1.  获取 `D` 的 `parentId`，记为 `P`。
        2.  查找所有 `parentId` 为 `D` 的子版本。
        3.  将这些子版本的 `parentId` 更新为 `P`。
        4.  从数据库中删除版本 `D`。
*   内容哈希与重复提醒:
    *   哈希生成: 在每次创建或更新版本时，对 `normalizedContent` (去除特定标点、转为小写后的内容) 计算 SHA256 哈希，存入 `contentHash`。
    *   ID策略: `id` 必须是与内容无关的唯一标识符。`contentHash` 仅作为辅助字段，用于快速对比和查重，绝不能作为主键 `id`，以避免树中不同位置的相同内容节点无法区分的问题。
    *   重复提醒: 在创建新版本保存后，使用其 `contentHash` 去 IndexedDB 的 `versions` 表中查询是否存在其他具有相同 `contentHash` 的记录。如果存在，则向用户发出提醒。

##### 4.2. 编辑器 (CodeMirror 6)

*   搜索: 集成 `@codemirror/search` 扩展包，即可获得完整的、支持正则和多行匹配的搜索功能。
*   智能选择:
    *   通过 CodeMirror 的 `EditorView.domEventHandlers` 监听 `mousedown` 和 `mousemove` 事件。
    *   在事件处理中，使用 `view.posAtCoords()` 获取鼠标位置对应的文本偏移量。
    *   使用 `view.state.wordAt()` 或自定义的边界检测函数获取该位置所属的完整单词/字符的范围。
    *   通过 `view.dispatch({ selection: ... })` 编程方式来更新编辑器的选区，从而实现“吸附”效果。

##### 4.3. UI 与可视化

*   版本树渲染:
    1.  从 IndexedDB 中获取某项目下的所有版本（一个扁平数组）。
    2.  在内存中，根据 `id` 和 `parentId` 将其重建成一个树状的数据结构。
    3.  使用 React 组件递归渲染该树。节点用 `<div>` 渲染，节点间的连线使用 SVG 的 `<path>` 元素绘制。
*   自动定位到最新版本:
    1.  项目加载时，在获取到的版本数组中，根据 `updatedAt` 字段找到时间戳最大的版本。
    2.  在 React 中，为每个版本节点组件关联一个 `ref`。
    3.  找到最新版本对应的组件 `ref`，并调用其 DOM 元素的 `.scrollIntoView({ block: 'center', behavior: 'smooth' })` 方法。
*   Diff 对比视图:
    *   集成 CodeMirror 的 `@codemirror/merge` 扩展包。这是一个功能完备的 Diff 工具，可以轻松实现并排（Side-by-Side）的对比视图，并自动高亮差异。

##### 4.4. 数据导入/导出与备份

*   导出:
    *   JSON: 查询数据库，将数据对象转换为 JSON 字符串，通过 `<a>` 标签下载。
    *   ZIP: 使用 JSZip。先创建 JSON 文件，然后遍历版本的附件，从 IndexedDB 中读取 `Blob` 数据，并逐一添加到 ZIP 实例中，最后生成并下载 ZIP 文件。
*   导入:
    *   通过 `<input type="file">` 获取用户上传的文件。
    *   如果是 ZIP，使用 JSZip 解压，读取其中的 JSON 和附件 Blobs。
    *   将解析出的数据通过 Dexie.js 的事务批量写入 IndexedDB。
*   WebDAV:
    *   使用 `webdav` 库的 `createClient` 方法。
    *   备份: 流程同导出，只是最后一步不是下载，而是调用 `client.putFileContents` 上传。
    *   还原: 调用 `client.getFileContents` 下载文件，然后走导入流程。
    *   关键: 必须在 UI 中明确提示用户，WebDAV 的可用性取决于对方服务器的 CORS 配置。