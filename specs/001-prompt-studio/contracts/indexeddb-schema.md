# IndexedDB Schema 契约

**Database Name**: `PromptStudioDB`  
**Version**: 1  
**Purpose**: 定义 Dexie.js 数据库结构和索引策略

## Schema 定义

```typescript
import Dexie, { Table } from 'dexie';

export class PromptStudioDB extends Dexie {
  // 表声明
  folders!: Table<Folder>;
  projects!: Table<Project>;
  versions!: Table<Version>;
  snippets!: Table<Snippet>;
  attachments!: Table<Attachment>;

  constructor() {
    super('PromptStudioDB');
    
    this.version(1).stores({
      // 主键, 索引字段1, 索引字段2, ...
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

## 表结构详细说明

### folders 表

**索引**:
- `id`: 主键，UUID
- `parentId`: 复合索引（用于查询子文件夹）
- `createdAt`: 复合索引（用于按时间排序）

**常见查询**:
```typescript
// 查找根级文件夹
await db.folders.where('parentId').equals(null).toArray();

// 查找特定文件夹的子文件夹
await db.folders.where('parentId').equals(folderId).toArray();

// 按创建时间倒序
await db.folders.orderBy('createdAt').reverse().toArray();
```

---

### projects 表

**索引**:
- `id`: 主键，UUID
- `folderId`: 复合索引（用于查询文件夹下的项目）
- `updatedAt`: 复合索引（用于按更新时间排序）
- `createdAt`: 复合索引（用于按创建时间排序）

**常见查询**:
```typescript
// 查找文件夹下的所有项目
await db.projects.where('folderId').equals(folderId).toArray();

// 查找最近更新的项目（Top 10）
await db.projects.orderBy('updatedAt').reverse().limit(10).toArray();

// 更新项目的 updatedAt
await db.projects.update(projectId, { updatedAt: Date.now() });
```

---

### versions 表

**索引**:
- `id`: 主键，UUID
- `projectId`: 复合索引（用于查询项目的所有版本）
- `parentId`: 复合索引（用于查询子版本）
- `contentHash`: 复合索引（用于重复检测）
- `updatedAt`: 复合索引（用于查找最新版本）
- `createdAt`: 复合索引（用于按创建时间排序）

**常见查询**:
```typescript
// 查找项目的所有版本
const versions = await db.versions.where('projectId').equals(projectId).toArray();

// 查找特定版本的子版本
const children = await db.versions.where('parentId').equals(versionId).toArray();

// 检测重复内容
const duplicate = await db.versions
  .where('contentHash')
  .equals(contentHash)
  .first();

// 查找项目中最新更新的版本
const latest = await db.versions
  .where('projectId')
  .equals(projectId)
  .and(v => v.updatedAt > 0)  // 确保有 updatedAt
  .sortBy('updatedAt');
const latestVersion = latest[latest.length - 1];

// 查找叶子节点（无子版本）
const allVersions = await db.versions.where('projectId').equals(projectId).toArray();
const versionIds = new Set(allVersions.map(v => v.id));
const parentIds = new Set(allVersions.map(v => v.parentId).filter(id => id !== null));
const leafNodes = allVersions.filter(v => !parentIds.has(v.id));
```

---

### snippets 表

**索引**:
- `id`: 主键，UUID
- `name`: 复合索引（用于名称搜索和排序）
- `createdAt`: 复合索引（用于按创建时间排序）

**常见查询**:
```typescript
// 查找所有片段，按名称排序
await db.snippets.orderBy('name').toArray();

// 按名称前缀搜索
await db.snippets.where('name').startsWithIgnoreCase('风格').toArray();

// 按创建时间倒序
await db.snippets.orderBy('createdAt').reverse().toArray();
```

---

### attachments 表

**索引**:
- `id`: 主键，UUID
- `versionId`: 复合索引（用于查询版本的附件）

**常见查询**:
```typescript
// 查找版本的所有附件
await db.attachments.where('versionId').equals(versionId).toArray();

// 批量查找多个版本的附件
await db.attachments.where('versionId').anyOf(versionIds).toArray();

// 删除版本的所有附件
await db.attachments.where('versionId').equals(versionId).delete();
```

---

## 事务管理

### 原子操作示例

```typescript
// 创建项目及其第一个版本（事务）
await db.transaction('rw', db.projects, db.versions, async () => {
  const project: Project = {
    id: crypto.randomUUID(),
    folderId,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await db.projects.add(project);
  
  const version: Version = {
    id: crypto.randomUUID(),
    projectId: project.id,
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: '',
    normalizedContent: '',
    contentHash: sha256(''),
  };
  
  await db.versions.add(version);
});
```

### 级联删除示例

```typescript
// 删除项目及其所有版本和附件（事务）
await db.transaction('rw', db.projects, db.versions, db.attachments, async () => {
  // 1. 获取所有版本
  const versions = await db.versions.where('projectId').equals(projectId).toArray();
  const versionIds = versions.map(v => v.id);
  
  // 2. 删除所有附件
  await db.attachments.where('versionId').anyOf(versionIds).delete();
  
  // 3. 删除所有版本
  await db.versions.where('projectId').equals(projectId).delete();
  
  // 4. 删除项目
  await db.projects.delete(projectId);
});
```

### 版本删除"接骨"逻辑

```typescript
// 删除版本并重新连接子版本（事务）
await db.transaction('rw', db.versions, db.attachments, async () => {
  const versionToDelete = await db.versions.get(versionId);
  if (!versionToDelete) return;
  
  // 1. 查找所有子版本
  const children = await db.versions
    .where('parentId')
    .equals(versionId)
    .toArray();
  
  // 2. 更新子版本的 parentId（接骨）
  for (const child of children) {
    await db.versions.update(child.id, { parentId: versionToDelete.parentId });
  }
  
  // 3. 删除附件
  await db.attachments.where('versionId').equals(versionId).delete();
  
  // 4. 删除版本
  await db.versions.delete(versionId);
  
  // 5. 更新项目的 updatedAt
  await db.projects.update(versionToDelete.projectId, { updatedAt: Date.now() });
});
```

---

## 性能优化建议

### 1. 批量操作

```typescript
// ❌ 低效：逐条插入
for (const version of versions) {
  await db.versions.add(version);
}

// ✅ 高效：批量插入
await db.versions.bulkAdd(versions);
```

### 2. 索引利用

```typescript
// ❌ 低效：遍历整个表
const project = (await db.projects.toArray()).find(p => p.name === 'Test');

// ✅ 高效：使用主键
const project = await db.projects.get(projectId);

// ⚠️ 中等：使用非索引字段（全表扫描）
const projects = await db.projects.filter(p => p.name === 'Test').toArray();
```

### 3. 懒加载

```typescript
// ❌ 低效：加载所有数据
const allVersions = await db.versions.toArray();

// ✅ 高效：仅加载需要的数据
const projectVersions = await db.versions
  .where('projectId')
  .equals(currentProjectId)
  .toArray();
```

---

## 数据迁移策略

当需要修改 schema 时（如添加字段、修改索引）：

```typescript
export class PromptStudioDB extends Dexie {
  constructor() {
    super('PromptStudioDB');
    
    // 版本 1（初始）
    this.version(1).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });
    
    // 版本 2（示例：添加 description 字段）
    this.version(2).stores({
      projects: 'id, folderId, updatedAt, createdAt',  // schema 不变
    }).upgrade(tx => {
      // 数据迁移逻辑
      return tx.table('projects').toCollection().modify(project => {
        if (!project.description) {
          project.description = '';  // 添加默认值
        }
      });
    });
    
    // 版本 3（示例：添加索引）
    this.version(3).stores({
      projects: 'id, folderId, updatedAt, createdAt, name',  // 添加 name 索引
    });
  }
}
```

---

## 存储配额监控

```typescript
// utils/quota.ts
export async function checkStorageQuota(): Promise<{
  used: number;
  total: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || 0;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    
    return { used, total, percentage };
  }
  
  return { used: 0, total: 0, percentage: 0 };
}

// 在应用启动时检查
const quota = await checkStorageQuota();
if (quota.percentage > 80) {
  console.warn(`存储空间已使用 ${quota.percentage.toFixed(1)}%`);
  // 显示警告给用户
}
```

---

## 契约保证

1. **主键唯一性**: 所有 `id` 字段使用 `crypto.randomUUID()` 生成，保证全局唯一
2. **外键完整性**: 应用层验证所有外键引用有效性（IndexedDB 不支持外键约束）
3. **索引一致性**: 索引字段必须在插入/更新时正确设置
4. **事务原子性**: 关键操作（创建项目、删除级联）使用 Dexie 事务保证
5. **数据验证**: 所有数据写入前经过 TypeScript 类型检查和自定义验证函数

**契约版本**: 1.0  
**最后更新**: 2025-11-16
