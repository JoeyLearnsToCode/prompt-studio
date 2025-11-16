# Phase 0: 技术研究与最佳实践

**Feature**: Prompt Studio - AI 提示词版本管理与编辑工具  
**Date**: 2025-11-16  
**Purpose**: 解决 Technical Context 中的技术选型问题，研究最佳实践和实现模式

## 研究任务总览

1. Material Design 3 在 TailwindCSS 中的实现方案
2. IndexedDB 最佳实践与 Dexie.js 使用模式
3. CodeMirror 6 + React 集成方案
4. 画布缩放/平移交互实现（无限画布）
5. 浏览器测试工具选择与配置

---

## 1. Material Design 3 + TailwindCSS 集成

### Decision: 使用 TailwindCSS + M3 色彩系统手动定制

### Rationale:
- M3 官方无 TailwindCSS 插件，但可通过 Tailwind 配置实现色彩系统
- 种子色 `rgb(207, 235, 131)` 通过 M3 Color Utilities 生成完整色板
- TailwindCSS 的设计令牌系统完美映射 M3 色彩角色（Primary, Secondary, Tertiary 等）

### Alternatives Considered:
1. **Material-UI (MUI) for React**: 
   - 优势：M3 官方组件库，开箱即用
   - 拒绝理由：组件过重，样式定制困难，与 TailwindCSS 集成复杂，违反"轻量依赖"原则
   
2. **Headless UI + 手动样式**:
   - 优势：完全控制，轻量
   - 拒绝理由：需要从零实现所有 M3 组件，开发成本过高

3. **选择方案**:
   - 使用 **Headless UI** 提供无样式组件基础（Modal, Menu, Transition 等）
   - TailwindCSS 定制 M3 色彩令牌和组件样式
   - 手动实现 M3 特有交互（Ripple 效果使用 CSS 动画或 `framer-motion`）

### Implementation Details:

**Step 1: 生成 M3 色彩方案**
```bash
# 使用 Material Theme Builder (在线工具)
https://m3.material.io/theme-builder#/custom

Input: Seed Color #cfe783 (207, 235, 131)
Output: 完整色板 JSON（primary, secondary, tertiary, surface, error 及其变体）
```

**Step 2: TailwindCSS 配置**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#cfe783',
          container: '#...',
          onPrimary: '#...',
          onContainer: '#...',
        },
        secondary: { /* ... */ },
        tertiary: { /* ... */ },
        surface: { /* ... */ },
        error: { /* ... */ },
      },
      borderRadius: {
        'm3-small': '8px',
        'm3-medium': '12px',
        'm3-large': '16px',
      },
      boxShadow: {
        'm3-1': '0px 1px 2px rgba(0,0,0,0.3)',
        'm3-2': '0px 2px 6px rgba(0,0,0,0.3)',
        'm3-3': '0px 4px 8px rgba(0,0,0,0.3)',
      },
    },
  },
}
```

**Step 3: Ripple 效果实现**
- 使用 `framer-motion` 的 `<motion.div>` 实现涟漪动画
- 或使用纯 CSS `::before` 伪元素 + `@keyframes`

---

## 2. IndexedDB + Dexie.js 最佳实践

### Decision: Dexie.js v3+ 作为 IndexedDB 封装层

### Rationale:
- Promise-based API 比原生 IndexedDB 事件驱动 API 简洁 10 倍
- 支持复合索引、全文搜索（通过插件）、事务管理
- TypeScript 类型支持良好
- 活跃维护，社区成熟

### Schema 设计原则:
```typescript
// db/schema.ts
import Dexie, { Table } from 'dexie';

export interface Folder {
  id: string;            // 主键：uuid
  name: string;
  parentId: string | null;  // 自引用外键
  createdAt: number;
}

export interface Project {
  id: string;
  folderId: string;      // 外键 → Folder.id
  name: string;
  createdAt: number;
  updatedAt: number;
  tags?: {
    model?: string;
    platform?: string;
    type?: string;
  };
}

export interface Version {
  id: string;
  projectId: string;     // 外键 → Project.id
  parentId: string | null;  // 自引用外键（树形结构）
  createdAt: number;
  updatedAt: number;
  content: string;       // 原始文本
  normalizedContent: string;  // 标准化文本
  contentHash: string;   // SHA-256 哈希
  score?: number;
}

export interface Snippet {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface Attachment {
  id: string;
  versionId: string;     // 外键 → Version.id
  fileName: string;
  fileType: string;      // MIME type
  blob: Blob;            // 二进制数据
}

export class PromptStudioDB extends Dexie {
  folders!: Table<Folder>;
  projects!: Table<Project>;
  versions!: Table<Version>;
  snippets!: Table<Snippet>;
  attachments!: Table<Attachment>;

  constructor() {
    super('PromptStudioDB');
    this.version(1).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });
  }
}

export const db = new PromptStudioDB();
```

### Best Practices:
1. **扁平化存储**: 所有实体以扁平数组存储，通过 ID 引用关联
2. **索引策略**: 在查询频繁的字段上建立索引（projectId, parentId, contentHash）
3. **事务管理**: 批量操作使用 `db.transaction()` 保证原子性
4. **版本迁移**: 使用 `.version(2).stores(...)` 处理 schema 升级

### 树形结构构建（内存中）:
```typescript
// utils/tree.ts
export function buildTree<T extends { id: string; parentId: string | null }>(
  items: T[]
): Map<string, T[]> {
  const childrenMap = new Map<string, T[]>();
  
  for (const item of items) {
    const parentId = item.parentId || 'root';
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(item);
  }
  
  return childrenMap;
}
```

---

## 3. CodeMirror 6 + React 集成

### Decision: 使用 `@codemirror/react-codemirror` + 自定义 Extension

### Rationale:
- CodeMirror 6 是模块化设计，按需加载功能扩展
- React 封装库提供受控组件接口
- 支持自定义主题（M3 风格）、智能选择、搜索等需求

### Implementation Pattern:
```typescript
// components/editor/PromptEditor.tsx
import { useCodeMirror } from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';

const m3Theme = EditorView.theme({
  '&': {
    color: 'var(--color-on-surface)',
    backgroundColor: 'var(--color-surface)',
  },
  '.cm-content': {
    caretColor: 'var(--color-primary)',
  },
  // ... 更多 M3 样式
});

function PromptEditor({ value, onChange }) {
  const { setContainer } = useCodeMirror({
    value,
    onChange: (val) => onChange(val),
    extensions: [
      m3Theme,
      search(),                    // 搜索功能
      keymap.of(searchKeymap),     // 搜索快捷键
      keymap.of([
        { key: 'Ctrl-Enter', run: () => { /* 创建新版本 */ } },
        { key: 'Ctrl-Shift-Enter', run: () => { /* 原地保存 */ } },
      ]),
      // 智能选择扩展（自定义）
      smartSelection(),
    ],
  });

  return <div ref={setContainer} />;
}
```

### 智能选择实现:
```typescript
// extensions/smartSelection.ts
import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export function smartSelection(): Extension {
  return EditorView.domEventHandlers({
    mousedown(event, view) {
      // 监听拖拽开始
    },
    mousemove(event, view) {
      // 获取当前位置的词法单元（word boundary）
      // 更新选区以整词/字为单位
    },
  });
}
```

### Diff 视图（版本对比）:
```typescript
import { MergeView } from '@codemirror/merge';

function DiffModal({ versionA, versionB }) {
  return (
    <MergeView
      orientation="a-b"
      original={versionA.content}
      modified={versionB.content}
      highlightChanges={true}
      theme={m3Theme}
    />
  );
}
```

---

## 4. 无限画布（缩放/平移）实现

### Decision: 使用 `react-zoom-pan-pinch` + 自定义 SVG 渲染

### Rationale:
- `react-zoom-pan-pinch` 处理复杂的缩放/平移手势和键盘事件
- SVG 渲染树状图提供无损缩放和精确定位
- 性能优化：虚拟滚动（仅渲染可见区域节点）

### Implementation:
```typescript
// components/canvas/VersionCanvas.tsx
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

function VersionCanvas({ versions }) {
  const tree = buildTree(versions);
  
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.1}
      maxScale={3}
      wheel={{ step: 0.05 }}
      panning={{ disabled: false }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <CanvasControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetTransform}
          />
          <TransformComponent>
            <svg width="5000" height="5000">
              {renderTreeNodes(tree)}
              {renderTreeEdges(tree)}
            </svg>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
}
```

### 树形布局算法:
```typescript
// utils/treeLayout.ts
export function layoutTree(tree: Map<string, Version[]>) {
  // 使用 Reingold-Tilford 算法或 Dagre 库
  // 计算每个节点的 (x, y) 坐标
  // 返回 Map<versionId, { x, y }>
}
```

### 性能优化:
- **虚拟滚动**: 仅渲染视口内的节点（使用 `react-window` 或自定义）
- **Canvas 降级**: 超过 500 节点时使用 HTML Canvas API 代替 SVG
- **节流**: 缩放/平移事件使用 `throttle`（100ms）

---

## 5. 浏览器测试工具选择

### Decision: Playwright（优先）或 chrome-devtools-mcp（如环境支持）

### Rationale:
- **Playwright**: 跨浏览器支持（Chrome, Firefox, Safari），录制模式，截图/视频，稳定的 API
- **chrome-devtools-mcp**: 如果 agent 环境提供 MCP 工具，优先使用（更深度集成）
- **fallback**: browser_use 或其他可用工具

### Playwright 配置:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',  // Vite dev server
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 示例测试:
```typescript
// tests/e2e/version-lifecycle.e2e.ts
import { test, expect } from '@playwright/test';

test('用户创建项目并保存第一个版本', async ({ page }) => {
  await page.goto('/');
  
  // 创建项目
  await page.click('button:text("创建项目")');
  await page.fill('input[name="projectName"]', '测试项目');
  await page.click('button:text("确定")');
  
  // 输入文本并保存
  await page.fill('.cm-content', '这是我的第一个提示词');
  await page.keyboard.press('Control+Enter');
  
  // 验证版本节点出现在画布
  await expect(page.locator('.version-node')).toHaveCount(1);
  
  // 刷新页面验证持久化
  await page.reload();
  await expect(page.locator('.version-node')).toHaveCount(1);
});
```

---

## 6. 其他技术研究

### 6.1 状态管理 - Zustand 模式

```typescript
// store/versionStore.ts
import create from 'zustand';
import { db } from '../db/schema';

interface VersionState {
  versions: Version[];
  currentVersionId: string | null;
  
  loadVersions: (projectId: string) => Promise<void>;
  createVersion: (projectId: string, content: string) => Promise<void>;
  updateVersion: (id: string, content: string) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  currentVersionId: null,
  
  loadVersions: async (projectId) => {
    const versions = await db.versions
      .where('projectId').equals(projectId)
      .toArray();
    set({ versions });
  },
  
  createVersion: async (projectId, content) => {
    const { currentVersionId } = get();
    const normalizedContent = normalize(content);
    const contentHash = sha256(normalizedContent);
    
    // 重复检查
    const duplicate = await db.versions
      .where('contentHash').equals(contentHash)
      .first();
    if (duplicate) {
      alert(`检测到重复版本：${duplicate.id}`);
    }
    
    const newVersion: Version = {
      id: crypto.randomUUID(),
      projectId,
      parentId: currentVersionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content,
      normalizedContent,
      contentHash,
    };
    
    await db.versions.add(newVersion);
    set({ versions: [...get().versions, newVersion], currentVersionId: newVersion.id });
  },
  
  // ...其他方法
}));
```

### 6.2 导入导出 - JSZip 模式

```typescript
// services/exportService.ts
import JSZip from 'jszip';
import { db } from '../db/schema';

export async function exportProjectAsZip(projectId: string): Promise<Blob> {
  const zip = new JSZip();
  
  // 导出数据
  const project = await db.projects.get(projectId);
  const versions = await db.versions.where('projectId').equals(projectId).toArray();
  const attachments = await db.attachments
    .where('versionId').anyOf(versions.map(v => v.id))
    .toArray();
  
  zip.file('data.json', JSON.stringify({ project, versions }));
  
  // 导出附件
  for (const att of attachments) {
    zip.file(`attachments/${att.fileName}`, att.blob);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

export async function importFromZip(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);
  
  const dataJson = await zip.file('data.json')!.async('string');
  const { project, versions } = JSON.parse(dataJson);
  
  await db.projects.add(project);
  await db.versions.bulkAdd(versions);
  
  // 导入附件
  const attachmentFiles = zip.folder('attachments')!.files;
  for (const [fileName, fileData] of Object.entries(attachmentFiles)) {
    const blob = await fileData.async('blob');
    // 解析 versionId 并存储
  }
}
```

---

## 研究总结

所有技术选型已确定，无 NEEDS CLARIFICATION 项。核心决策：

1. ✅ **M3 + TailwindCSS**: 手动定制色彩系统 + Headless UI
2. ✅ **IndexedDB**: Dexie.js v3+ 封装，扁平化 schema 设计
3. ✅ **编辑器**: CodeMirror 6 + React 封装 + 自定义扩展
4. ✅ **画布**: react-zoom-pan-pinch + SVG 渲染 + 虚拟滚动
5. ✅ **测试**: Playwright（主）+ chrome-devtools-mcp（备选）

**Next Step**: Phase 1 - 数据模型设计和契约定义
