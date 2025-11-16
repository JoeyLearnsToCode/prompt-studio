# Phase 1: 数据模型设计

**Feature**: Prompt Studio - AI 提示词版本管理与编辑工具  
**Date**: 2025-11-16  
**Purpose**: 定义所有实体的数据结构、关系和验证规则

## 数据模型总览

Prompt Studio 采用扁平化数据模型，所有实体以独立数组形式存储在 IndexedDB 中，通过 ID 引用建立关联关系。树形结构（文件夹树、版本树）在内存中动态构建。

### 实体关系图（ER Diagram）

```
Folder (1) ──┬─> (N) Folder (自引用，通过 parentId)
             └─> (N) Project

Project (1) ──> (N) Version

Version (1) ──┬─> (N) Version (自引用，通过 parentId)
              └─> (N) Attachment

Snippet (独立实体，无外键关联)
```

---

## 实体定义

### 1. Folder（文件夹）

**用途**: 组织项目的容器，支持多层嵌套

**字段定义**:

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | string | ✓ | 主键 | UUID，全局唯一标识符 |
| `name` | string | ✓ | - | 文件夹名称，1-100 字符 |
| `parentId` | string \| null | ✓ | 索引 | 父文件夹 ID，null 表示根级文件夹 |
| `createdAt` | number | ✓ | 索引 | 创建时间戳（毫秒） |

**TypeScript 接口**:
```typescript
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}
```

**验证规则**:
- `id`: 必须是有效的 UUID v4
- `name`: 长度 1-100，不允许空白字符串，不允许包含 `/` `\` `:` `*` `?` `"` `<` `>` `|`
- `parentId`: 如果非 null，必须引用有效的 Folder.id，且不能形成循环引用
- `createdAt`: 必须是正整数，不能大于当前时间

**状态转换**:
- 创建 → 存在
- 存在 → 重命名（更新 name）
- 存在 → 移动（更新 parentId）
- 存在 → 删除（级联删除：子文件夹和项目移动到父文件夹或根）

---

### 2. Project（项目）

**用途**: 管理一组相关版本的顶层容器

**字段定义**:

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | string | ✓ | 主键 | UUID，全局唯一标识符 |
| `folderId` | string | ✓ | 索引 | 所属文件夹 ID |
| `name` | string | ✓ | - | 项目名称，1-200 字符 |
| `createdAt` | number | ✓ | 索引 | 创建时间戳（毫秒） |
| `updatedAt` | number | ✓ | 索引 | 最后更新时间戳（毫秒），项目内任何版本变化时自动更新 |
| `tags` | object | - | - | 可选标签对象 |
| `tags.model` | string | - | - | 模型标签，如 "GPT-4", "Midjourney" |
| `tags.platform` | string | - | - | 平台标签，如 "OpenAI", "Poe" |
| `tags.type` | string | - | - | 类型标签，如 "对话", "图片生成" |

**TypeScript 接口**:
```typescript
export interface Project {
  id: string;
  folderId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  tags?: {
    model?: string;
    platform?: string;
    type?: string;
  };
}
```

**验证规则**:
- `id`: 必须是有效的 UUID v4
- `folderId`: 必须引用有效的 Folder.id
- `name`: 长度 1-200，不允许空白字符串
- `createdAt`: 必须是正整数，不能大于当前时间
- `updatedAt`: 必须 >= createdAt
- `tags.*`: 每个标签长度 0-50 字符

**状态转换**:
- 创建 → 存在
- 存在 → 重命名（更新 name）
- 存在 → 移动（更新 folderId）
- 存在 → 更新标签（更新 tags）
- 存在 → 版本变化时自动更新 updatedAt
- 存在 → 删除（级联删除：所有版本和附件）

---

### 3. Version（版本）

**用途**: 提示词的单个版本，构成树状结构

**字段定义**:

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | string | ✓ | 主键 | UUID，全局唯一标识符 |
| `projectId` | string | ✓ | 索引 | 所属项目 ID |
| `parentId` | string \| null | ✓ | 索引 | 父版本 ID，null 表示根版本 |
| `createdAt` | number | ✓ | 索引 | 创建时间戳（毫秒） |
| `updatedAt` | number | ✓ | 索引 | 最后更新时间戳（毫秒），原地更新时变化 |
| `content` | string | ✓ | - | 原始提示词文本，0-50,000 字符 |
| `normalizedContent` | string | ✓ | - | 标准化文本（用于对比和哈希计算） |
| `contentHash` | string | ✓ | 索引 | normalizedContent 的 SHA-256 哈希值（十六进制） |
| `score` | number | - | - | 可选评分，1-5 |

**TypeScript 接口**:
```typescript
export interface Version {
  id: string;
  projectId: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content: string;
  normalizedContent: string;
  contentHash: string;
  score?: number;
}
```

**验证规则**:
- `id`: 必须是有效的 UUID v4
- `projectId`: 必须引用有效的 Project.id
- `parentId`: 如果非 null，必须引用有效的 Version.id（同一项目内），且不能形成循环引用
- `createdAt`: 必须是正整数，不能大于当前时间
- `updatedAt`: 必须 >= createdAt
- `content`: 长度 0-50,000 字符
- `normalizedContent`: 由 `normalize(content)` 计算得出（去除首尾空白、统一换行符）
- `contentHash`: 64 字符十六进制字符串，由 `sha256(normalizedContent)` 计算
- `score`: 如果存在，必须是 1-5 的整数

**状态转换**:
- 创建 → 存在
- 存在（叶子节点）→ 原地更新（更新 content, normalizedContent, contentHash, updatedAt）
- 存在 → 创建子版本（新版本的 parentId = 当前版本 id）
- 存在 → 删除（接骨逻辑：子版本的 parentId 指向被删版本的 parentId）
- 存在 → 更新评分（更新 score）

**重要逻辑**:
- **重复检测**: 创建新版本时，查询 `contentHash` 索引，如果存在相同哈希的版本，提示用户
- **原地更新限制**: 仅叶子节点（无子版本）可原地更新
- **删除接骨**: 删除版本时，查找所有 `parentId === 被删版本id` 的版本，更新其 `parentId` 为被删版本的 `parentId`

---

### 4. Snippet（片段）

**用途**: 可复用的文本片段

**字段定义**:

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | string | ✓ | 主键 | UUID，全局唯一标识符 |
| `name` | string | ✓ | 索引 | 片段名称，1-100 字符 |
| `content` | string | ✓ | - | 片段内容，1-10,000 字符 |
| `createdAt` | number | ✓ | 索引 | 创建时间戳（毫秒） |

**TypeScript 接口**:
```typescript
export interface Snippet {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}
```

**验证规则**:
- `id`: 必须是有效的 UUID v4
- `name`: 长度 1-100，不允许空白字符串
- `content`: 长度 1-10,000 字符
- `createdAt`: 必须是正整数，不能大于当前时间

**状态转换**:
- 创建 → 存在
- 存在 → 重命名（更新 name）
- 存在 → 编辑内容（更新 content）
- 存在 → 删除

---

### 5. Attachment（附件）

**用途**: 版本关联的图片或视频文件

**字段定义**:

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | string | ✓ | 主键 | UUID，全局唯一标识符 |
| `versionId` | string | ✓ | 索引 | 所属版本 ID |
| `fileName` | string | ✓ | - | 文件名，包含扩展名，1-255 字符 |
| `fileType` | string | ✓ | - | MIME 类型，如 "image/png", "video/mp4" |
| `blob` | Blob | ✓ | - | 二进制数据 |

**TypeScript 接口**:
```typescript
export interface Attachment {
  id: string;
  versionId: string;
  fileName: string;
  fileType: string;
  blob: Blob;
}
```

**验证规则**:
- `id`: 必须是有效的 UUID v4
- `versionId`: 必须引用有效的 Version.id
- `fileName`: 长度 1-255，必须包含扩展名（.jpg, .png, .gif, .mp4, .webm 等）
- `fileType`: 必须是有效的 MIME 类型，且匹配文件扩展名
- `blob`: 大小不超过 50MB（浏览器配额限制）

**状态转换**:
- 创建 → 存在
- 存在 → 删除（级联：版本删除时自动删除附件）

**支持的文件类型**:
- 图片: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- 视频: `video/mp4`, `video/webm`

---

## 工具函数

### 文本标准化

```typescript
// utils/normalize.ts
export function normalize(text: string): string {
  return text
    .trim()                          // 去除首尾空白
    .replace(/\r\n/g, '\n')          // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/\s+$/gm, '')           // 去除行尾空白
    .replace(/\n{3,}/g, '\n\n');     // 多余空行压缩为两行
}
```

### 哈希计算

```typescript
// utils/hash.ts
import sha256 from 'js-sha256';

export function computeContentHash(content: string): string {
  const normalized = normalize(content);
  return sha256(normalized);
}
```

### 树形结构构建

```typescript
// utils/tree.ts
export interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
}

export function buildTree<T extends { id: string; parentId: string | null }>(
  items: T[]
): TreeNode<T>[] {
  const idMap = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // 第一次遍历：创建所有节点
  for (const item of items) {
    idMap.set(item.id, { data: item, children: [] });
  }

  // 第二次遍历：建立父子关系
  for (const item of items) {
    const node = idMap.get(item.id)!;
    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = idMap.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // 孤儿节点（数据不一致），作为根处理
        roots.push(node);
      }
    }
  }

  return roots;
}
```

---

## 数据迁移策略

### 版本 1 → 版本 2（示例）

如果未来需要添加新字段或修改 schema：

```typescript
// db/migrations.ts
export class PromptStudioDB extends Dexie {
  constructor() {
    super('PromptStudioDB');
    
    // 版本 1
    this.version(1).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });
    
    // 版本 2（示例：添加 Project.description 字段）
    this.version(2).stores({
      projects: 'id, folderId, updatedAt, createdAt',  // schema 不变
    }).upgrade(tx => {
      // 数据迁移逻辑
      return tx.table('projects').toCollection().modify(project => {
        project.description = '';  // 添加默认值
      });
    });
  }
}
```

---

## 约束总结

### 级联删除规则

1. **Folder 删除**:
   - 子 Folder → 移动到被删 Folder 的 parentId
   - 关联 Project → 移动到被删 Folder 的 parentId

2. **Project 删除**:
   - 所有 Version → 删除
   - 所有 Attachment（通过 Version） → 删除

3. **Version 删除**:
   - 子 Version → 更新 parentId 为被删 Version 的 parentId（接骨）
   - 关联 Attachment → 删除

4. **Snippet 删除**: 无级联影响（独立实体）

5. **Attachment 删除**: 无级联影响

### 唯一性约束

- 所有实体的 `id` 必须全局唯一（UUID v4 保证）
- 同一 Folder 下的 Folder 和 Project 的 `name` **无唯一性要求**（允许重名）
- 同一 Project 下的 Version 的 `contentHash` **无唯一性要求**（仅用于提醒）

### 索引策略

| 表 | 索引字段 | 用途 |
|---|---|---|
| folders | `id` (主键) | 查找单个文件夹 |
| folders | `parentId` | 查找子文件夹 |
| projects | `id` (主键) | 查找单个项目 |
| projects | `folderId` | 查找文件夹下的项目 |
| projects | `updatedAt` | 按更新时间排序 |
| versions | `id` (主键) | 查找单个版本 |
| versions | `projectId` | 查找项目的所有版本 |
| versions | `parentId` | 查找子版本 |
| versions | `contentHash` | 重复检测 |
| snippets | `id` (主键) | 查找单个片段 |
| snippets | `name` | 按名称搜索 |
| attachments | `id` (主键) | 查找单个附件 |
| attachments | `versionId` | 查找版本的附件 |

---

## 数据完整性验证

在应用启动和关键操作后，执行完整性检查：

```typescript
// utils/validation.ts
export async function validateDataIntegrity(): Promise<string[]> {
  const errors: string[] = [];
  
  // 检查孤儿 Project（folderId 不存在）
  const projects = await db.projects.toArray();
  const folderIds = new Set((await db.folders.toArray()).map(f => f.id));
  for (const project of projects) {
    if (!folderIds.has(project.folderId)) {
      errors.push(`Project ${project.id} 引用了不存在的 Folder ${project.folderId}`);
    }
  }
  
  // 检查孤儿 Version（projectId 不存在）
  const versions = await db.versions.toArray();
  const projectIds = new Set(projects.map(p => p.id));
  for (const version of versions) {
    if (!projectIds.has(version.projectId)) {
      errors.push(`Version ${version.id} 引用了不存在的 Project ${version.projectId}`);
    }
  }
  
  // 检查循环引用（Folder）
  // ... （深度优先搜索检测环）
  
  return errors;
}
```

---

**数据模型设计完成**。下一步：生成 IndexedDB Schema 契约和状态管理契约。
