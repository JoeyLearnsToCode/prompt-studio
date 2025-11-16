import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/schema';
import { useProjectStore } from '@/store/projectStore';

describe('ProjectManager Service', () => {
  beforeEach(async () => {
    // 清空数据库
    await db.folders.clear();
    await db.projects.clear();
  });

  it('应该能够创建项目', async () => {
    const store = useProjectStore.getState();
    
    // 先创建文件夹
    const folderId = await store.createFolder('测试文件夹', null);
    
    // 创建项目
    const projectId = await store.createProject('测试项目', folderId);
    
    expect(projectId).toBeTruthy();
    
    // 验证项目已保存
    const project = await db.projects.get(projectId);
    expect(project).toBeDefined();
    expect(project?.name).toBe('测试项目');
    expect(project?.folderId).toBe(folderId);
  });

  it('应该能够重命名项目', async () => {
    const store = useProjectStore.getState();
    
    const folderId = await store.createFolder('测试文件夹', null);
    const projectId = await store.createProject('旧名称', folderId);
    
    await store.renameProject(projectId, '新名称');
    
    const project = await db.projects.get(projectId);
    expect(project?.name).toBe('新名称');
  });

  it('应该能够删除项目及其所有版本', async () => {
    const store = useProjectStore.getState();
    
    const folderId = await store.createFolder('测试文件夹', null);
    const projectId = await store.createProject('测试项目', folderId);
    
    await store.deleteProject(projectId);
    
    const project = await db.projects.get(projectId);
    expect(project).toBeUndefined();
  });
});
