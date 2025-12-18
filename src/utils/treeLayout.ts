/**
 * 树形布局算法（基于 Reingold-Tilford）
 * 用于计算版本树的节点位置
 */

import type { VersionTreeNode } from './tree';

export interface LayoutConfig {
  levelHeight: number; // 层级间距（垂直）
  siblingWidth: number; // 兄弟节点间距（水平）
  nodeWidth: number; // 节点宽度
  nodeHeight: number; // 节点高度
}

export const defaultLayoutConfig: LayoutConfig = {
  levelHeight: 150,
  siblingWidth: 220,
  nodeWidth: 200,
  nodeHeight: 120,
};

/**
 * 计算子树的宽度
 */
function getSubtreeWidth(node: VersionTreeNode, config: LayoutConfig): number {
  if (node.children.length === 0) {
    return config.nodeWidth;
  }

  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += getSubtreeWidth(child, config);
  }

  return Math.max(totalWidth, config.nodeWidth);
}

/**
 * 简化版 Reingold-Tilford 算法
 * 递归计算每个节点的位置
 */
export function calculateTreeLayout(
  root: VersionTreeNode,
  config: LayoutConfig = defaultLayoutConfig,
  x = 0,
  y = 0
): VersionTreeNode {
  root.x = x;
  root.y = y;

  if (root.children.length === 0) {
    return root;
  }

  // 计算子节点的总宽度
  const childrenWidth = root.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child, config),
    0
  );

  // 计算起始 x 位置（使子节点居中）
  let currentX = x - (childrenWidth - config.nodeWidth) / 2;

  // 递归计算每个子节点的位置
  for (const child of root.children) {
    const subtreeWidth = getSubtreeWidth(child, config);
    const childX = currentX + subtreeWidth / 2 - config.nodeWidth / 2;
    const childY = y + config.levelHeight;

    calculateTreeLayout(child, config, childX, childY);
    currentX += subtreeWidth;
  }

  return root;
}

/**
 * 计算多个根节点的布局（森林）
 */
export function calculateForestLayout(
  roots: VersionTreeNode[],
  config: LayoutConfig = defaultLayoutConfig
): VersionTreeNode[] {
  let currentX = 0;

  for (const root of roots) {
    const subtreeWidth = getSubtreeWidth(root, config);
    const rootX = currentX + subtreeWidth / 2 - config.nodeWidth / 2;

    calculateTreeLayout(root, config, rootX, 0);
    currentX += subtreeWidth + config.siblingWidth;
  }

  return roots;
}

/**
 * 获取树的边界框
 */
export function getTreeBounds(roots: VersionTreeNode[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const traverse = (node: VersionTreeNode) => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);

    for (const child of node.children) {
      traverse(child);
    }
  };

  for (const root of roots) {
    traverse(root);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + defaultLayoutConfig.nodeWidth,
    height: maxY - minY + defaultLayoutConfig.nodeHeight,
  };
}

/**
 * 居中布局（将树居中到指定画布大小）
 */
export function centerLayout(
  roots: VersionTreeNode[],
  canvasWidth: number,
  canvasHeight: number
): VersionTreeNode[] {
  const bounds = getTreeBounds(roots);

  const offsetX = (canvasWidth - bounds.width) / 2 - bounds.minX;
  const offsetY = (canvasHeight - bounds.height) / 2 - bounds.minY;

  const applyOffset = (node: VersionTreeNode) => {
    node.x += offsetX;
    node.y += offsetY;

    for (const child of node.children) {
      applyOffset(child);
    }
  };

  for (const root of roots) {
    applyOffset(root);
  }

  return roots;
}

/**
 * 查找最新的叶子节点（用于自动定位）
 */
export function findLatestLeaf(roots: VersionTreeNode[]): VersionTreeNode | null {
  let latestNode: VersionTreeNode | null = null;
  let latestTime = 0;

  const traverse = (node: VersionTreeNode) => {
    if (node.children.length === 0) {
      // 叶子节点
      if (node.version.updatedAt > latestTime) {
        latestTime = node.version.updatedAt;
        latestNode = node;
      }
    } else {
      for (const child of node.children) {
        traverse(child);
      }
    }
  };

  for (const root of roots) {
    traverse(root);
  }

  return latestNode;
}
