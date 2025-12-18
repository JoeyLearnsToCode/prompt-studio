/**
 * 树形结构构建工具
 */

import type { Version } from '@/models/Version';

export interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
}

export interface VersionTreeNode {
  id: string;
  version: Version;
  children: VersionTreeNode[];
  x: number;
  y: number;
}

/**
 * 从扁平数组构建树形结构
 * @param items 扁平数组,每个元素必须有 id 和 parentId
 * @returns 根节点数组
 */
export function buildTree<T extends { id: string; parentId: string | null }>(
  items: T[]
): TreeNode<T>[] {
  const idMap = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // 第一次遍历: 创建所有节点
  for (const item of items) {
    idMap.set(item.id, { data: item, children: [] });
  }

  // 第二次遍历: 建立父子关系
  for (const item of items) {
    const node = idMap.get(item.id)!;
    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = idMap.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // 孤儿节点(数据不一致),作为根处理
        roots.push(node);
      }
    }
  }

  return roots;
}

/**
 * 构建版本树（专用于 Version 实体）
 */
export function buildVersionTree(versions: Version[]): VersionTreeNode[] {
  const idMap = new Map<string, VersionTreeNode>();
  const roots: VersionTreeNode[] = [];

  // 创建所有节点
  for (const version of versions) {
    idMap.set(version.id, {
      id: version.id,
      version,
      children: [],
      x: 0,
      y: 0,
    });
  }

  // 建立父子关系
  for (const version of versions) {
    const node = idMap.get(version.id)!;
    if (!version.parentId) {
      roots.push(node);
    } else {
      const parent = idMap.get(version.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

/**
 * 计算树形布局 - 改进的 Reingold-Tilford 算法
 * 根据子树的实际宽度计算节点位置，避免重叠
 *
 * @param root 根节点
 * @param nodeWidth 单个节点的宽度
 * @param nodeHeight 单个节点的高度
 * @param horizontalSpacing 节点之间的水平间距
 * @param verticalSpacing 层级之间的垂直间距
 */
export function calculateTreeLayout(
  root: VersionTreeNode,
  nodeWidth = 200,
  nodeHeight = 80,
  horizontalSpacing = 40,
  verticalSpacing = 100
): VersionTreeNode {
  // 第一步：后序遍历，计算每个子树的宽度
  function calculateSubtreeWidth(node: VersionTreeNode): number {
    if (node.children.length === 0) {
      // 叶子节点，宽度就是节点本身的宽度
      return nodeWidth;
    }

    // 递归计算所有子节点的宽度
    const childrenWidths = node.children.map((child) => calculateSubtreeWidth(child));

    // 子树总宽度 = 所有子节点宽度之和 + 子节点之间的间距
    const totalWidth =
      childrenWidths.reduce((sum, w) => sum + w, 0) +
      (node.children.length - 1) * horizontalSpacing;

    // 返回当前节点宽度和子树总宽度中的较大值
    return Math.max(nodeWidth, totalWidth);
  }

  // 第二步：前序遍历，根据子树宽度设置节点位置
  function layoutNode(node: VersionTreeNode, x: number, y: number, subtreeWidth: number): void {
    // 节点位置 = 子树宽度的中心
    node.x = x + (subtreeWidth - nodeWidth) / 2;
    node.y = y;

    if (node.children.length === 0) {
      return;
    }

    // 计算所有子节点的宽度
    const childrenWidths = node.children.map((child) => calculateSubtreeWidth(child));
    const totalChildrenWidth =
      childrenWidths.reduce((sum, w) => sum + w, 0) +
      (node.children.length - 1) * horizontalSpacing;

    // 子树起始 X 位置（让子树在父节点下方居中）
    let childX = x + (subtreeWidth - totalChildrenWidth) / 2;
    const childY = y + nodeHeight + verticalSpacing;

    // 递归布局每个子节点
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childWidth = childrenWidths[i];

      layoutNode(child, childX, childY, childWidth);

      childX += childWidth + horizontalSpacing;
    }
  }

  // 计算根节点的子树宽度
  const rootSubtreeWidth = calculateSubtreeWidth(root);

  // 从 (0, 0) 开始布局
  layoutNode(root, 0, 0, rootSubtreeWidth);

  return root;
}

/**
 * 遍历树的所有节点(深度优先)
 */
export function traverseTree<T>(
  nodes: TreeNode<T>[],
  callback: (node: TreeNode<T>, depth: number) => void,
  depth = 0
): void {
  for (const node of nodes) {
    callback(node, depth);
    traverseTree(node.children, callback, depth + 1);
  }
}

/**
 * 查找树中的节点
 */
export function findNode<T extends { id: string }>(
  nodes: TreeNode<T>[],
  id: string
): TreeNode<T> | null {
  for (const node of nodes) {
    if (node.data.id === id) {
      return node;
    }
    const found = findNode(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * 按名称升序排序
 * 支持自然排序（例如：proj-1, proj-2, proj-10）
 */
export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}
