import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/schema';

// 占位测试 - 组件将在后续实现
describe('ProjectList Component', () => {
  beforeEach(async () => {
    await db.folders.clear();
    await db.projects.clear();
  });

  it('应该渲染项目列表', () => {
    // TODO: 实现组件后添加完整测试
    expect(true).toBe(true);
  });
});
