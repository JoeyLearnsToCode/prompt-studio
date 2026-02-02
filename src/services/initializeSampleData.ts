/**
 * 初始化示例数据服务
 * 为全新用户创建示例项目和版本
 */

import { db } from '@/db/schema';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { translations } from '@/i18n/locales';
import { initializeLanguage } from '@/i18n/detectLanguage';
import type { Locale } from '@/i18n/types';

/**
 * 检查是否为全新用户（LocalStorage和IndexedDB都没有数据）
 */
async function isNewUser(): Promise<boolean> {
  // 检查是否首次打开
  const hasOpenedBefore = Object.values(STORAGE_KEYS).some(
    (key) => storage.get(key, null) !== null
  );
  if (hasOpenedBefore) {
    return false; // 已经打开过
  }

  // 检查IndexedDB中是否有项目
  const projectCount = await db.projects.count();
  return projectCount === 0;
}

/**
 * 创建示例项目和版本
 * @returns 创建的项目ID
 */
async function createSampleProject(): Promise<string> {
  // 获取当前语言的翻译
  const locale: Locale = initializeLanguage();
  const t = translations[locale];

  // 使用 store 创建示例项目（无文件夹）
  // 注意：createProject 会自动创建一个空的根版本
  const { createProject } = useProjectStore.getState();
  const projectId = await createProject(t.sampleData.projectName, 'root');

  // 获取自动创建的根版本
  const versions = await db.versions.where('projectId').equals(projectId).toArray();
  const rootVersion = versions.find((v) => v.parentId === null);
  if (!rootVersion) {
    throw new Error('Failed to get root version');
  }

  // 更新根版本的内容和名称
  const { updateVersionInPlace } = useVersionStore.getState();
  await updateVersionInPlace(rootVersion.id, t.sampleData.versions.root.content, t.sampleData.versions.root.name);

  // 使用 store 创建根分支1（作为根版本的子版本）
  const { createVersion } = useVersionStore.getState();
  await createVersion(
    projectId,
    t.sampleData.versions.branch1.content,
    rootVersion.id,
    false, // skipDuplicateCheck
    t.sampleData.versions.branch1.name
  );

  // 使用 store 创建根分支2（作为根版本的子版本）
  await createVersion(
    projectId,
    t.sampleData.versions.branch2.content,
    rootVersion.id,
    false, // skipDuplicateCheck
    t.sampleData.versions.branch2.name
  );

  return projectId;
}

/**
 * 初始化示例数据（如果是全新用户）
 * @returns 如果创建了示例项目，返回项目ID；否则返回null
 */
export async function initializeSampleData(): Promise<string | null> {
  try {
    if (await isNewUser()) {
      console.log('检测到全新用户，正在创建示例项目...');

      const projectId = await createSampleProject();
      console.log('示例项目创建完成');

      return projectId;
    }

    return null;
  } catch (error) {
    console.error('创建示例项目失败:', error);
    return null;
  }
}
