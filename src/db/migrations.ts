import { db } from './schema';

/**
 * 数据库迁移工具
 *
 * 使用示例:
 * db.version(2).stores({...}).upgrade(tx => {
 *   // 数据迁移逻辑
 * });
 */

/**
 * 验证数据库是否需要迁移
 */
export async function checkMigrationNeeded(): Promise<boolean> {
  const currentVersion = (db as any).verno;
  const latestVersion = 2; // 当前最新版本

  return currentVersion < latestVersion;
}

/**
 * 执行数据库迁移
 */
export async function runMigrations(): Promise<void> {
  // 版本2：添加版本名称支持
  (db as any)
    .version(2)
    .stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt, name',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    })
    .upgrade(() => {
      // 无需数据迁移，name字段是可选的
      console.log('Upgraded to version 2: Added version name support');
    });

  console.log(`Database version: ${(db as any).verno}`);
}
