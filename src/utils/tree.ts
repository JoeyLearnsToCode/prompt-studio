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
 * 计算树形布局（简单版 Reingold-Tilford 算法）
 */
export function calculateTreeLayout(
  root: VersionTreeNode,
  x = 0,
  y = 0,
  levelHeight = 150,
  siblingWidth = 220
): VersionTreeNode {
  root.x = x;
  root.y = y;

  if (root.children.length === 0) {
    return root;
  }

  // 递归计算子节点
  const childY = y + levelHeight;
  let currentX = x - ((root.children.length - 1) * siblingWidth) / 2;

  for (const child of root.children) {
    calculateTreeLayout(child, currentX, childY, levelHeight, siblingWidth);
    currentX += siblingWidth;
  }

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
