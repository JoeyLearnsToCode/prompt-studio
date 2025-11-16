import { describe, it, expect } from 'vitest';
import { buildVersionTree, calculateTreeLayout } from '@/utils/tree';
import type { Version } from '@/models/Version';

describe('树形结构工具', () => {
  const mockVersions: Version[] = [
    {
      id: '1',
      projectId: 'p1',
      content: 'Root',
      contentHash: 'hash1',
      normalizedContent: 'root',
      parentId: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      projectId: 'p1',
      content: 'Child 1',
      contentHash: 'hash2',
      normalizedContent: 'child 1',
      parentId: '1',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      projectId: 'p1',
      content: 'Child 2',
      contentHash: 'hash3',
      normalizedContent: 'child 2',
      parentId: '1',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  it('应该构建正确的树形结构', () => {
    const tree = buildVersionTree(mockVersions);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('1');
    expect(tree[0].children).toHaveLength(2);
  });

  it('应该计算节点布局位置', () => {
    const tree = buildVersionTree(mockVersions);
    const layout = calculateTreeLayout(tree[0]);
    expect(layout.x).toBeDefined();
    expect(layout.y).toBeDefined();
  });
});
