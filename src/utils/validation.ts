import { db } from '@/db/schema';

/**
 * 数据验证工具
 */

/**
 * 验证数据完整性
 * @returns 错误信息数组,如果没有错误则返回空数组
 */
export async function validateDataIntegrity(): Promise<string[]> {
  const errors: string[] = [];

  try {
    // 检查孤儿 Project (folderId 不存在)
    const projects = await db.projects.toArray();
    const folderIds = new Set((await db.folders.toArray()).map((f) => f.id));

    for (const project of projects) {
      if (!folderIds.has(project.folderId)) {
        errors.push(`Project ${project.id} 引用了不存在的 Folder ${project.folderId}`);
      }
    }

    // 检查孤儿 Version (projectId 不存在)
    const versions = await db.versions.toArray();
    const projectIds = new Set(projects.map((p) => p.id));

    for (const version of versions) {
      if (!projectIds.has(version.projectId)) {
        errors.push(`Version ${version.id} 引用了不存在的 Project ${version.projectId}`);
      }
    }

    // 检查循环引用 (Folder)
    const folderCycles = detectCycles(await db.folders.toArray());
    if (folderCycles.length > 0) {
      errors.push(`检测到文件夹循环引用: ${folderCycles.join(', ')}`);
    }

    // 检查循环引用 (Version)
    const versionCycles = detectCycles(await db.versions.toArray());
    if (versionCycles.length > 0) {
      errors.push(`检测到版本循环引用: ${versionCycles.join(', ')}`);
    }
  } catch (error) {
    errors.push(`验证过程出错: ${error}`);
  }

  return errors;
}

/**
 * 检测循环引用
 */
function detectCycles<T extends { id: string; parentId: string | null }>(
  items: T[]
): string[] {
  const cycles: string[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const idMap = new Map(items.map((item) => [item.id, item]));

  function dfs(id: string, path: string[]): void {
    if (recursionStack.has(id)) {
      cycles.push(`循环: ${path.join(' -> ')} -> ${id}`);
      return;
    }

    if (visited.has(id)) {
      return;
    }

    visited.add(id);
    recursionStack.add(id);
    path.push(id);

    const item = idMap.get(id);
    if (item?.parentId) {
      dfs(item.parentId, [...path]);
    }

    recursionStack.delete(id);
  }

  for (const item of items) {
    if (!visited.has(item.id)) {
      dfs(item.id, []);
    }
  }

  return cycles;
}

/**
 * 验证 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 验证文件名
 */
export function isValidFileName(name: string): boolean {
  if (name.length < 1 || name.length > 255) {
    return false;
  }
  // 禁止的字符: / \ : * ? " < > |
  const invalidChars = /[/\\:*?"<>|]/;
  return !invalidChars.test(name);
}

/**
 * 验证 MIME 类型
 */
export function isValidMimeType(mimeType: string): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
  ];
  return supportedTypes.includes(mimeType);
}
