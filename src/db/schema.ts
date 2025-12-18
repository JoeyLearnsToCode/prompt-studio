import Dexie, { Table } from 'dexie';
import type { Folder } from '@/models/Folder';
import type { Project } from '@/models/Project';
import type { Version } from '@/models/Version';
import type { Snippet } from '@/models/Snippet';
import type { Attachment } from '@/models/Attachment';

export class PromptStudioDB extends Dexie {
  // 表声明
  folders!: Table<Folder>;
  projects!: Table<Project>;
  versions!: Table<Version>;
  snippets!: Table<Snippet>;
  attachments!: Table<Attachment>;

  constructor() {
    super('PromptStudioDB');

    (this as any).version(1).stores({
      // 主键, 索引字段1, 索引字段2, ...
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });

    // 版本2：添加版本名称支持
    (this as any).version(2).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt, name',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });

    // 版本3：添加版本备注支持（score字段已在Version接口中定义，无需索引）
    (this as any).version(3).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt, name',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });
  }
}

export const db = new PromptStudioDB();
