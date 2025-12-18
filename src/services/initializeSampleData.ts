/**
 * 初始化示例数据服务
 * 为全新用户创建示例项目和版本
 */

import { db } from '@/db/schema';
import { projectManager } from './projectManager';
import { versionManager } from './versionManager';
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

  // 创建示例项目（无文件夹）
  const project = await projectManager.createProject(t.sampleData.projectName, null as any);

  // 创建根版本
  const rootVersion = await versionManager.createVersion(
    project.id,
    t.sampleData.versions.root.content,
    null,
    undefined, // score
    t.sampleData.versions.root.name // name
  );

  // 创建根分支1
  await versionManager.createVersion(
    project.id,
    t.sampleData.versions.branch1.content,
    rootVersion.id,
    undefined, // score
    t.sampleData.versions.branch1.name // name
  );

  // 创建根分支2
  await versionManager.createVersion(
    project.id,
    t.sampleData.versions.branch2.content,
    rootVersion.id,
    undefined, // score
    t.sampleData.versions.branch2.name // name
  );

  return project.id;
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
