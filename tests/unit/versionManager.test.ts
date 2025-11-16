import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/schema';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';

describe('VersionManager Service', () => {
  let projectId: string;

  beforeEach(async () => {
    await db.folders.clear();
    await db.projects.clear();
    await db.versions.clear();
    
    // 创建测试项目
    const projectStore = useProjectStore.getState();
    const folderId = await projectStore.createFolder('测试文件夹', null);
    projectId = await projectStore.createProject('测试项目', folderId);
  });

  it('应该能够创建版本', async () => {
    const store = useVersionStore.getState();
    
    const versionId = await store.createVersion(projectId, '这是第一个版本', null);
    
    expect(versionId).toBeTruthy();
    
    const version = await db.versions.get(versionId);
    expect(version).toBeDefined();
    expect(version?.content).toBe('这是第一个版本');
    expect(version?.parentId).toBeNull();
  });

  it('应该能够创建子版本', async () => {
    const store = useVersionStore.getState();
    
    const parentId = await store.createVersion(projectId, '父版本', null);
    const childId = await store.createVersion(projectId, '子版本', parentId);
    
    const child = await db.versions.get(childId);
    expect(child?.parentId).toBe(parentId);
  });

  it('应该能够原地更新叶子节点', async () => {
    const store = useVersionStore.getState();
    
    const versionId = await store.createVersion(projectId, '原始内容', null);
    await store.updateVersionInPlace(versionId, '更新后的内容');
    
    const version = await db.versions.get(versionId);
    expect(version?.content).toBe('更新后的内容');
  });

  it('应该检测重复内容', async () => {
    const store = useVersionStore.getState();
    
    await store.createVersion(projectId, '重复的内容', null);
    const duplicate = await store.checkDuplicate('重复的内容');
    
    expect(duplicate).toBeDefined();
    expect(duplicate?.content).toBe('重复的内容');
  });

  it('删除版本时应该执行接骨逻辑', async () => {
    const store = useVersionStore.getState();
    
    const v1 = await store.createVersion(projectId, 'V1', null);
    const v2 = await store.createVersion(projectId, 'V2', v1);
    const v3 = await store.createVersion(projectId, 'V3', v2);
    
    // 删除中间节点 v2
    await store.deleteVersion(v2);
    
    const version3 = await db.versions.get(v3);
    expect(version3?.parentId).toBe(v1); // v3 的 parentId 应该更新为 v1
  });
});
