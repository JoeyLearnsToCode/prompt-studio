import { describe, it, expect } from 'vitest';
import { buildTree } from '../../src/utils/tree';

describe('tree utils', () => {
  describe('buildTree', () => {
    it('应该构建简单的树结构', () => {
      const items = [
        { id: '1', parentId: null, name: 'root1' },
        { id: '2', parentId: '1', name: 'child1' },
        { id: '3', parentId: '1', name: 'child2' },
      ];

      const tree = buildTree(items);

      expect(tree).toHaveLength(1);
      expect(tree[0].data.id).toBe('1');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].data.id).toBe('2');
      expect(tree[0].children[1].data.id).toBe('3');
    });

    it('应该处理多个根节点', () => {
      const items = [
        { id: '1', parentId: null, name: 'root1' },
        { id: '2', parentId: null, name: 'root2' },
        { id: '3', parentId: '1', name: 'child1' },
      ];

      const tree = buildTree(items);

      expect(tree).toHaveLength(2);
      expect(tree.find(n => n.data.id === '1')).toBeTruthy();
      expect(tree.find(n => n.data.id === '2')).toBeTruthy();
    });

    it('应该处理深层嵌套', () => {
      const items = [
        { id: '1', parentId: null, name: 'root' },
        { id: '2', parentId: '1', name: 'level1' },
        { id: '3', parentId: '2', name: 'level2' },
        { id: '4', parentId: '3', name: 'level3' },
      ];

      const tree = buildTree(items);

      expect(tree).toHaveLength(1);
      expect(tree[0].children[0].children[0].children[0].data.id).toBe('4');
    });

    it('应该处理孤儿节点（parentId 不存在）', () => {
      const items = [
        { id: '1', parentId: null, name: 'root' },
        { id: '2', parentId: 'non-existent', name: 'orphan' },
      ];

      const tree = buildTree(items);

      // 孤儿节点应该被视为根节点
      expect(tree).toHaveLength(2);
      expect(tree.find(n => n.data.id === '2')).toBeTruthy();
    });

    it('应该处理空数组', () => {
      const tree = buildTree([]);
      expect(tree).toHaveLength(0);
    });

    it('应该处理相同 parentId 的多个子节点', () => {
      const items = [
        { id: '1', parentId: null, name: 'root' },
        { id: '2', parentId: '1', name: 'child1' },
        { id: '3', parentId: '1', name: 'child2' },
        { id: '4', parentId: '1', name: 'child3' },
        { id: '5', parentId: '2', name: 'grandchild' },
      ];

      const tree = buildTree(items);

      expect(tree[0].children).toHaveLength(3);
      expect(tree[0].children[0].children).toHaveLength(1);
    });

    it('应该保持数据引用不变', () => {
      const item1 = { id: '1', parentId: null, name: 'root' };
      const item2 = { id: '2', parentId: '1', name: 'child' };
      const items = [item1, item2];

      const tree = buildTree(items);

      expect(tree[0].data).toBe(item1);
      expect(tree[0].children[0].data).toBe(item2);
    });
  });
});
