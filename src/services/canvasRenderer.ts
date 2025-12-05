/**
 * Canvas 渲染引擎 - 基于 HTML Canvas 2D API
 * 负责渲染版本树的节点、连线、标签
 */

import type { Version } from '@/models/Version';
import { buildVersionTree, calculateTreeLayout, type VersionTreeNode } from '@/utils/tree';

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
  private resizeTimer: number | null = null;

  // M3 颜色主题 - 提高对比度
  private colors = {
    primary: '#a8c548',
    primaryContainer: '#d9f799',
    onPrimary: '#1a2400',
    surface: '#fdfcf5',
    surfaceVariant: '#e4e3d6',
    onSurface: '#1b1c18',
    onSurfaceVariant: '#2a2b24',
    outline: '#5a5c52',
    // 选中版本节点使用绿色 #76a866
    selectedNode: '#76a866',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
    this.ctx = ctx;

    this.resizeCanvas();
  }

  /**
   * 调整画布大小以匹配容器（带防抖）
   */
  resizeCanvas() {
    // 如果已有定时器在运行，说明在防抖期间，不执行
    if (this.resizeTimer !== null) {
      return;
    }

    // 执行实际的resize
    this.performResize();
    
    // 设置定时器，150ms内不允许再次执行
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = null;
    }, 150);
  }

  /**
   * 执行实际的 resize 操作
   */
  private performResize() {
    // 使用父元素的尺寸，而不是 canvas 自身的 getBoundingClientRect
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    // 直接使用逻辑像素,不考虑DPR
    // Canvas会自动处理高分屏的像素缩放
    this.canvas.width = width;
    this.canvas.height = height;

    // 设置显示尺寸
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // 重新获取context以重置所有变换
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      // 不再应用DPR缩放,让浏览器自动处理
    }

    // 重新绘制
    this.draw();
  }

  /**
   * 渲染版本树
   */
  renderTree(versions: Version[]) {
    // 构建树形结构
    const roots = buildVersionTree(versions);
    
    // 定义节点尺寸和间距
    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalSpacing = 30;  // 紧凑一点的水平间距
    const verticalSpacing = 80;     // 紧凑一点的垂直间距
    
    // 计算布局
    this.nodes = [];
    let offsetX = 50; // 初始偏移
    
    roots.forEach((root) => {
      // 使用新的布局算法，传入节点尺寸参数
      const layout = calculateTreeLayout(root, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing);
      this.nodes.push(this.convertToCanvasNode(layout, offsetX));
      
      // 计算下一棵树的起始位置（当前树宽度 + 额外间距）
      const treeWidth = this.calculateSubtreeWidth(layout, nodeWidth, horizontalSpacing);
      offsetX += treeWidth + 100; // 树之间额外100px间距
    });

    // 绘制
    this.draw();
  }

  /**
   * 计算子树宽度（用于多根树的水平排列）
   */
  private calculateSubtreeWidth(node: VersionTreeNode, nodeWidth: number, horizontalSpacing: number): number {
    if (node.children.length === 0) {
      return nodeWidth;
    }
    const childrenWidths = node.children.map((child: VersionTreeNode) => 
      this.calculateSubtreeWidth(child, nodeWidth, horizontalSpacing)
    );
    return childrenWidths.reduce((sum: number, w: number) => sum + w, 0) + 
           (node.children.length - 1) * horizontalSpacing;
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

    // 清空画布 - canvas.width/height就是逻辑像素
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
   * 绘制连线 - 使用横平竖直的直角连接
   */
  private drawConnections(node: CanvasNode) {
    const { ctx } = this;

    node.children.forEach((child) => {
      const parentCenterX = node.x + node.width / 2;
      const parentBottomY = node.y + node.height;
      const childCenterX = child.x + child.width / 2;
      const childTopY = child.y;

      ctx.beginPath();
      ctx.strokeStyle = this.colors.outline;
      ctx.lineWidth = 2;

      if (node.children.length === 1) {
        // 只有一个子节点时，使用垂直直线
        ctx.moveTo(parentCenterX, parentBottomY);
        ctx.lineTo(parentCenterX, childTopY);
      } else {
        // 多个子节点时，使用横平竖直的折线
        // 1. 从父节点底部中心向下
        const midY = parentBottomY + (childTopY - parentBottomY) / 2;
        ctx.moveTo(parentCenterX, parentBottomY);
        ctx.lineTo(parentCenterX, midY);
        
        // 2. 水平连接到子节点中心X位置
        ctx.lineTo(childCenterX, midY);
        
        // 3. 向下连接到子节点顶部
        ctx.lineTo(childCenterX, childTopY);
      }

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
      ? this.colors.selectedNode
      : this.colors.surface;
    // 选中节点不显示边框，看起来无边框
    // if (!isSelected) {
    //   ctx.strokeStyle = this.colors.outline;
    //   ctx.lineWidth = 1;
    // }

    this.roundRect(ctx, node.x, node.y, node.width, node.height, 12);
    ctx.fill();
    // 只有未选中的节点才绘制边框
    // if (!isSelected) {
    //   ctx.stroke();
    // }

    // 版本名称（如果有）
    let currentY = node.y + 8;
    if (node.version.name) {
      ctx.fillStyle = this.colors.onSurface;
      ctx.font = 'bold 14px sans-serif';
      ctx.textBaseline = 'top';
      
      // 限制名称长度并添加省略号
      const displayName = node.version.name.length > 20 
        ? node.version.name.substring(0, 20) + '...' 
        : node.version.name;
      
      ctx.fillText(displayName, node.x + 8, currentY);
      currentY += 22; // 增加行高，为版本名称预留空间
    }

    // 文本内容（截断）
    ctx.fillStyle = this.colors.onSurface;
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';

    // 先按换行符分割，保留原始行结构
    const originalLines = node.version.content.split('\n').filter(line => line.trim() !== '');
    
    // 根据是否有版本名称调整显示的内容行数
    const maxLines = node.version.name ? 3 : 4;
    
    let currentLineIndex = 0;
    const maxWidth = node.width - 16;
    
    // 处理每一行的显示
    for (let i = 0; i < originalLines.length && currentLineIndex < maxLines; i++) {
      const line = originalLines[i];
      const isLastLine = i === originalLines.length - 1;
      const remainingLines = maxLines - currentLineIndex;
      
      // 检查文本是否超出卡片宽度
      const metrics = ctx.measureText(line);
      
      if (metrics.width > maxWidth) {
        // 如果是最后一行且还有剩余空间（至少2行），允许换行
        if (isLastLine && remainingLines >= 2) {
          // 将长行分割成多行
          const chars = line.split('');
          let tempLine = '';
          const wrappedLines: string[] = [];
          
          for (const char of chars) {
            const testLine = tempLine + char;
            if (ctx.measureText(testLine).width > maxWidth) {
              if (tempLine) {
                wrappedLines.push(tempLine);
                tempLine = char;
              } else {
                wrappedLines.push(char);
                tempLine = '';
              }
            } else {
              tempLine = testLine;
            }
          }
          
          if (tempLine) {
            wrappedLines.push(tempLine);
          }
          
          // 显示换行后的内容
          const linesToShow = Math.min(wrappedLines.length, remainingLines);
          for (let j = 0; j < linesToShow; j++) {
            let displayText = wrappedLines[j];
            
            // 如果是最后一行且还有更多内容，添加省略号
            if (j === linesToShow - 1 && wrappedLines.length > linesToShow) {
              let truncatedText = displayText;
              while (ctx.measureText(truncatedText + '...').width > maxWidth && truncatedText.length > 0) {
                truncatedText = truncatedText.slice(0, -1);
              }
              displayText = truncatedText + '...';
            }
            
            ctx.fillText(displayText, node.x + 8, currentY + currentLineIndex * 18);
            currentLineIndex++;
          }
        } else {
          // 其他情况，截断并添加省略号
          let truncatedText = line;
          while (ctx.measureText(truncatedText + '...').width > maxWidth && truncatedText.length > 0) {
            truncatedText = truncatedText.slice(0, -1);
          }
          ctx.fillText(truncatedText + '...', node.x + 8, currentY + currentLineIndex * 18);
          currentLineIndex++;
        }
      } else {
        // 文本未超出宽度，直接显示
        ctx.fillText(line, node.x + 8, currentY + currentLineIndex * 18);
        currentLineIndex++;
      }
    }

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

  /**
   * 将节点定位到指定比例位置
   * @param nodeId 节点ID
   * @param xRatio 水平位置比例 (0-1)，0.5表示居中
   * @param yRatio 垂直位置比例 (0-1)，0.5表示居中
   */
  centerNodeAtPosition(nodeId: string, xRatio: number = 0.5, yRatio: number = 0.5) {
    const node = this.flattenNodes().find((n) => n.id === nodeId);
    if (!node) return;

    const targetX = this.canvas.width * xRatio;
    const targetY = this.canvas.height * yRatio;

    this.transform.x = targetX - (node.x + node.width / 2) * this.transform.scale;
    this.transform.y = targetY - (node.y + node.height / 2) * this.transform.scale;

    this.draw();
  }
}
