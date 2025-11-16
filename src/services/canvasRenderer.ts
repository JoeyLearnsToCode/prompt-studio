/**
 * Canvas 渲染引擎 - 基于 HTML Canvas 2D API
 * 负责渲染版本树的节点、连线、标签
 */

import type { Version } from '@/models/Version';
import { buildVersionTree, calculateTreeLayout } from '@/utils/tree';

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  version: Version;
  children: CanvasNode[];
}

export interface CanvasTransform {
  x: number; // 平移 X
  y: number; // 平移 Y
  scale: number; // 缩放比例
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private transform: CanvasTransform = { x: 0, y: 0, scale: 1 };
  private nodes: CanvasNode[] = [];
  private selectedNodeId: string | null = null;

  // M3 颜色主题
  private colors = {
    primary: '#cfe783',
    primaryContainer: '#d9f799',
    onPrimary: '#2b3a00',
    surface: '#fdfcf5',
    surfaceVariant: '#e4e3d6',
    onSurface: '#1b1c18',
    onSurfaceVariant: '#46483f',
    outline: '#767970',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
    this.ctx = ctx;

    this.resizeCanvas();
  }

  /**
   * 调整画布大小以匹配容器
   */
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  /**
   * 渲染版本树
   */
  renderTree(versions: Version[]) {
    // 构建树形结构
    const roots = buildVersionTree(versions);
    
    // 计算布局
    this.nodes = [];
    roots.forEach((root, index) => {
      const layout = calculateTreeLayout(root);
      this.nodes.push(this.convertToCanvasNode(layout, index * 300));
    });

    // 绘制
    this.draw();
  }

  /**
   * 转换为画布节点
   */
  private convertToCanvasNode(
    treeNode: any,
    offsetX: number = 0
  ): CanvasNode {
    const node: CanvasNode = {
      id: treeNode.id,
      x: treeNode.x + offsetX + 50,
      y: treeNode.y + 50,
      width: 200,
      height: 80,
      version: treeNode.version,
      children: [],
    };

    if (treeNode.children) {
      node.children = treeNode.children.map((child: any) =>
        this.convertToCanvasNode(child, offsetX)
      );
    }

    return node;
  }

  /**
   * 执行绘制
   */
  private draw() {
    const { ctx, canvas } = this;
    const { x, y, scale } = this.transform;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 绘制连线
    this.nodes.forEach((node) => this.drawConnections(node));

    // 绘制节点
    this.nodes.forEach((node) => this.drawNode(node));

    ctx.restore();
  }

  /**
   * 绘制连线
   */
  private drawConnections(node: CanvasNode) {
    const { ctx } = this;

    node.children.forEach((child) => {
      ctx.beginPath();
      ctx.moveTo(node.x + node.width / 2, node.y + node.height);
      ctx.lineTo(child.x + child.width / 2, child.y);
      ctx.strokeStyle = this.colors.outline;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 递归绘制子节点连线
      this.drawConnections(child);
    });
  }

  /**
   * 绘制节点
   */
  private drawNode(node: CanvasNode) {
    const { ctx } = this;
    const isSelected = node.id === this.selectedNodeId;

    // 背景
    ctx.fillStyle = isSelected
      ? this.colors.primaryContainer
      : this.colors.surface;
    ctx.strokeStyle = isSelected ? this.colors.primary : this.colors.outline;
    ctx.lineWidth = isSelected ? 3 : 1;

    this.roundRect(ctx, node.x, node.y, node.width, node.height, 12);
    ctx.fill();
    ctx.stroke();

    // 文本内容（截断）
    ctx.fillStyle = this.colors.onSurface;
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';

    const content = node.version.content.substring(0, 50);
    const lines = this.wrapText(ctx, content, node.width - 16);
    
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, node.x + 8, node.y + 8 + i * 20);
    });

    // 时间戳
    ctx.fillStyle = this.colors.onSurfaceVariant;
    ctx.font = '11px sans-serif';
    const date = new Date(node.version.createdAt).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    ctx.fillText(date, node.x + 8, node.y + node.height - 20);

    // 递归绘制子节点
    node.children.forEach((child) => this.drawNode(child));
  }

  /**
   * 绘制圆角矩形
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * 文本换行
   */
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 设置变换
   */
  setTransform(transform: Partial<CanvasTransform>) {
    this.transform = { ...this.transform, ...transform };
    this.draw();
  }

  /**
   * 缩放
   */
  zoom(delta: number, centerX: number, centerY: number) {
    const newScale = Math.max(0.1, Math.min(3, this.transform.scale + delta));
    
    // 以鼠标位置为中心缩放
    const scaleDiff = newScale - this.transform.scale;
    this.transform.x -= centerX * scaleDiff;
    this.transform.y -= centerY * scaleDiff;
    this.transform.scale = newScale;

    this.draw();
  }

  /**
   * 平移
   */
  pan(dx: number, dy: number) {
    this.transform.x += dx;
    this.transform.y += dy;
    this.draw();
  }

  /**
   * 选择节点
   */
  selectNode(nodeId: string | null) {
    this.selectedNodeId = nodeId;
    this.draw();
  }

  /**
   * 点击检测
   */
  hitTest(x: number, y: number): string | null {
    // 转换坐标到画布空间
    const canvasX = (x - this.transform.x) / this.transform.scale;
    const canvasY = (y - this.transform.y) / this.transform.scale;

    // 检测所有节点
    for (const node of this.flattenNodes()) {
      if (
        canvasX >= node.x &&
        canvasX <= node.x + node.width &&
        canvasY >= node.y &&
        canvasY <= node.y + node.height
      ) {
        return node.id;
      }
    }

    return null;
  }

  /**
   * 展平节点树
   */
  private flattenNodes(): CanvasNode[] {
    const result: CanvasNode[] = [];
    const traverse = (node: CanvasNode) => {
      result.push(node);
      node.children.forEach(traverse);
    };
    this.nodes.forEach(traverse);
    return result;
  }

  /**
   * 重置视图
   */
  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    this.draw();
  }

  /**
   * 居中显示指定节点
   */
  centerNode(nodeId: string) {
    const node = this.flattenNodes().find((n) => n.id === nodeId);
    if (!node) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.transform.x = centerX - (node.x + node.width / 2) * this.transform.scale;
    this.transform.y = centerY - (node.y + node.height / 2) * this.transform.scale;

    this.draw();
  }
}
