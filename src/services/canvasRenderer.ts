/**
 * Canvas 渲染引擎 - 基于 HTML Canvas 2D API
 * 负责渲染版本树的节点、连线、标签
 */

import type { Version } from '@/models/Version';
import { colors } from '@/styles/tokens';
import { followRate, followTo, prefersReducedMotion } from '@/styles/motion';
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

/**
 * 画布上的字体栈。Canvas 读不到 Tailwind，必须自己写。
 * 标题走无衬线（印刷报头的字），正文走等宽（登记卡上的记录行）。
 */
const CANVAS_FONT_SANS =
  '"Noto Sans SC", system-ui, -apple-system, "Microsoft YaHei", "PingFang SC", sans-serif';
const CANVAS_FONT_MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Noto Sans SC", "Microsoft YaHei", monospace';

export interface CanvasTransform {
  x: number; // 平移 X
  y: number; // 平移 Y
  scale: number; // 缩放比例
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private transform: CanvasTransform = { x: 0, y: 0, scale: 1 };
  /** 视口的去向：拖拽直接同步两者（1:1 跟手），离散指令只改目标再滑过去 */
  private targetTransform: CanvasTransform = { x: 0, y: 0, scale: 1 };
  private nodes: CanvasNode[] = [];
  private selectedNodeId: string | null = null;
  private hoveredNodeId: string | null = null;
  /** 每个节点自己的 hover 进度，逐个缓动，避免整棵树同频闪动 */
  private hoverProgress = new Map<string, number>();
  private resizeTimer: number | null = null;
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private disposed = false;

  // 连线圆角：几乎是直角，和卡片同一套形状语言
  private cornerRadius = 3;

  // Theme Colors - initialized with defaults, updated in updateThemeColors
  private themeColors = {
    /** 印章色：只画在选中节点的框线上 */
    accent: colors.primary.DEFAULT,
    surface: colors.surface.DEFAULT,
    onSurface: colors.text.light.primary,
    onSurfaceVariant: colors.text.light.secondary,
    outline: colors.border.DEFAULT,
    connection: colors.text.light.muted,
    /** 硬边阴影：油墨压进纸面，不带模糊 */
    plate: 'rgba(35, 32, 27, 0.12)',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
    this.ctx = ctx;

    // Check for dark mode to adjust surface colors
    this.updateThemeColors();
    this.resizeCanvas();
  }

  public updateThemeColors() {
    const isDark = document.documentElement.classList.contains('dark');
    this.themeColors = {
      // 暗房里印章要提亮，压在深底上才看得见
      accent: isDark ? colors.primary.darkAccent : colors.primary.DEFAULT,
      surface: isDark ? colors.surface.dark : colors.surface.DEFAULT,
      onSurface: isDark ? colors.text.dark.primary : colors.text.light.primary,
      // 记录行要读得清：用次级墨色而不是最淡的一档
      onSurfaceVariant: isDark ? colors.text.dark.secondary : colors.text.light.secondary,
      outline: isDark ? colors.border.dark : colors.border.DEFAULT,
      connection: isDark ? colors.text.dark.muted : colors.text.light.muted,
      plate: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(35, 32, 27, 0.12)',
    };
  }

  /**
   * 节流重算尺寸。尾部补一次：面板展开/收起的过渡结束后，
   * 最后一次尺寸变化不能被节流窗口吃掉，否则画布会停在中间尺寸上。
   */
  resizeCanvas() {
    if (this.resizeTimer !== null) {
      return;
    }
    this.performResize();
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = null;
      if (!this.disposed) this.performResize();
    }, 150);
  }

  private performResize() {
    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 设置实际渲染尺寸（考虑设备像素比）
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      // 重新获取 context 后重置 scale
      this.ctx.scale(dpr, dpr);
    }

    this.updateThemeColors(); // Re-check theme on resize/redraw
    this.draw();
  }

  renderTree(versions: Version[]) {
    const roots = buildVersionTree(versions);

    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalSpacing = 30;
    const verticalSpacing = 80;

    this.nodes = [];
    let offsetX = 50;

    roots.forEach((root) => {
      const layout = calculateTreeLayout(
        root,
        nodeWidth,
        nodeHeight,
        horizontalSpacing,
        verticalSpacing
      );
      this.nodes.push(this.convertToCanvasNode(layout, offsetX));

      const treeWidth = this.calculateSubtreeWidth(layout, nodeWidth, horizontalSpacing);
      offsetX += treeWidth + 100;
    });

    this.draw();
  }

  private calculateSubtreeWidth(
    node: VersionTreeNode,
    nodeWidth: number,
    horizontalSpacing: number
  ): number {
    if (node.children.length === 0) {
      return nodeWidth;
    }
    const childrenWidths = node.children.map((child: VersionTreeNode) =>
      this.calculateSubtreeWidth(child, nodeWidth, horizontalSpacing)
    );
    return (
      childrenWidths.reduce((sum: number, w: number) => sum + w, 0) +
      (node.children.length - 1) * horizontalSpacing
    );
  }

  private convertToCanvasNode(treeNode: any, offsetX: number = 0): CanvasNode {
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

  public draw() {
    const { ctx, canvas } = this;
    const { x, y, scale } = this.transform;

    // 获取实际渲染尺寸（考虑设备像素比）
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 1. 绘制连线 (递归绘制所有连线)
    this.nodes.forEach((node) => this.drawConnections(node));

    // 2. 绘制所有节点
    // 获取所有扁平化节点以确保所有节点都被绘制
    const allNodes = this.flattenNodes();

    // 排序：将选中的节点放在最后绘制，使其处于最上层
    allNodes.sort((a, b) => {
      if (a.id === this.selectedNodeId) return 1;
      if (b.id === this.selectedNodeId) return -1;
      return 0;
    });

    allNodes.forEach((node) => this.drawNode(node));

    ctx.restore();
  }

  private drawConnections(node: CanvasNode) {
    const { ctx } = this;

    node.children.forEach((child) => {
      const parentCenterX = node.x + node.width / 2;
      const parentBottomY = node.y + node.height;
      const childCenterX = child.x + child.width / 2;
      const childTopY = child.y;

      ctx.beginPath();
      ctx.strokeStyle = this.themeColors.connection;
      ctx.lineWidth = 1.5;

      // 如果父子节点的 X 坐标几乎相同（垂直对齐），直接画直线
      if (Math.abs(parentCenterX - childCenterX) < 1) {
        ctx.moveTo(parentCenterX, parentBottomY);
        ctx.lineTo(parentCenterX, childTopY);
      } else {
        // 否则画带圆角的折线 (Manhattan routing with rounded corners)
        const midY = parentBottomY + (childTopY - parentBottomY) / 2;

        ctx.moveTo(parentCenterX, parentBottomY);

        // 绘制第一个弯：从父节点底部向下，在 midY 处转向子节点水平方向
        // arcTo 会自动从当前点画一条直线到切点，然后画圆弧
        ctx.arcTo(parentCenterX, midY, childCenterX, midY, this.cornerRadius);

        // 绘制第二个弯：从 midY 水平延伸，在子节点 X 轴处转向向下
        // arcTo 会自动从当前点画一条直线到切点，然后画圆弧
        ctx.arcTo(childCenterX, midY, childCenterX, childTopY, this.cornerRadius);

        // 最后画直线到子节点顶部
        ctx.lineTo(childCenterX, childTopY);
      }

      ctx.stroke();
      this.drawConnections(child);
    });
  }

  private drawNode(node: CanvasNode) {
    const { ctx } = this;
    const isSelected = node.id === this.selectedNodeId;
    const hover = this.hoverProgress.get(node.id) ?? 0;

    // hover 抬升：2px 整像素（1.5px 在 1x 屏上会落在半像素上发糊）
    ctx.save();
    ctx.translate(0, -2 * hover);

    // Background：永远是纸面，选中与否只体现在框线上
    ctx.fillStyle = this.themeColors.surface;

    // 硬边阴影（不带模糊）：像一张压在桌面上的登记卡
    ctx.shadowColor = this.themeColors.plate;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2 + hover;

    this.roundRect(ctx, node.x, node.y, node.width, node.height, 3); // 3px radius
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (isSelected) {
      // 选中：盖一道 2px 的印章色框线
      ctx.strokeStyle = this.themeColors.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = this.themeColors.outline;
      ctx.lineWidth = 1;
      ctx.stroke();

      // hover 走墨色而不是印章色：印章色留给"选中"独占，两个状态才分得开
      if (hover > 0.001) {
        ctx.save();
        ctx.globalAlpha = hover;
        ctx.strokeStyle = this.themeColors.onSurface;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Text Color
    const textColor = this.themeColors.onSurface;

    // Version Name
    let currentY = node.y + 16; // Padding top
    if (node.version.name) {
      ctx.fillStyle = textColor;
      ctx.font = `bold 13px ${CANVAS_FONT_SANS}`;
      ctx.textBaseline = 'top';

      const displayName =
        node.version.name.length > 20
          ? node.version.name.substring(0, 20) + '...'
          : node.version.name;

      ctx.fillText(displayName, node.x + 12, currentY);
      currentY += 20;
    }

    // Content：记录行用等宽淡墨，和标题的报头字拉开层次
    ctx.fillStyle = this.themeColors.onSurfaceVariant;
    ctx.font = `13px ${CANVAS_FONT_MONO}`;
    ctx.textBaseline = 'top';

    const originalLines = node.version.content.split('\n').filter((line) => line.trim() !== '');
    const maxLines = node.version.name ? 2 : 3;
    let currentLineIndex = 0;
    const maxWidth = node.width - 24; // Padding 12px * 2

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
              while (
                ctx.measureText(truncatedText + '...').width > maxWidth &&
                truncatedText.length > 0
              ) {
                truncatedText = truncatedText.slice(0, -1);
              }
              displayText = truncatedText + '...';
            }

            ctx.fillText(displayText, node.x + 12, currentY + currentLineIndex * 18);
            currentLineIndex++;
          }
        } else {
          // 其他情况，截断并添加省略号
          let truncatedText = line;
          while (
            ctx.measureText(truncatedText + '...').width > maxWidth &&
            truncatedText.length > 0
          ) {
            truncatedText = truncatedText.slice(0, -1);
          }
          ctx.fillText(truncatedText + '...', node.x + 12, currentY + currentLineIndex * 18);
          currentLineIndex++;
        }
      } else {
        // 文本未超出宽度，直接显示
        ctx.fillText(line, node.x + 12, currentY + currentLineIndex * 18);
        currentLineIndex++;
      }
    }

    ctx.restore();
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

  setTransform(transform: Partial<CanvasTransform>) {
    this.transform = { ...this.transform, ...transform };
    this.targetTransform = { ...this.transform };
    this.draw();
  }

  /**
   * 缩放：目标累加、焦点保持，然后滑过去。
   * 连续滚轮会不断抬高目标，当前值持续追随，天然形成惯性。
   */
  zoom(delta: number, centerX: number, centerY: number) {
    const from = this.targetTransform.scale;
    const to = Math.max(0.1, Math.min(3, from + delta));
    const ratio = to / from;
    this.targetTransform.x = centerX - (centerX - this.targetTransform.x) * ratio;
    this.targetTransform.y = centerY - (centerY - this.targetTransform.y) * ratio;
    this.targetTransform.scale = to;
    this.startAnimation();
  }

  /** 拖拽平移必须 1:1：当前值与目标一起走，不引入任何滞后 */
  pan(dx: number, dy: number) {
    this.transform.x += dx;
    this.transform.y += dy;
    this.targetTransform.x = this.transform.x;
    this.targetTransform.y = this.transform.y;
    this.draw();
  }

  selectNode(nodeId: string | null) {
    this.selectedNodeId = nodeId;
    this.draw();
  }

  setHoveredNode(nodeId: string | null) {
    if (this.hoveredNodeId === nodeId) return;
    this.hoveredNodeId = nodeId;
    this.startAnimation();
  }

  hitTest(x: number, y: number): string | null {
    const canvasX = (x - this.transform.x) / this.transform.scale;
    const canvasY = (y - this.transform.y) / this.transform.scale;

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

  private flattenNodes(): CanvasNode[] {
    const result: CanvasNode[] = [];
    const traverse = (node: CanvasNode) => {
      result.push(node);
      node.children.forEach(traverse);
    };
    this.nodes.forEach(traverse);
    return result;
  }

  resetView() {
    this.targetTransform = { x: 0, y: 0, scale: 1 };
    this.startAnimation();
  }

  centerNode(nodeId: string) {
    this.centerNodeAtPosition(nodeId);
  }

  centerNodeAtPosition(nodeId: string, xRatio: number = 0.5, yRatio: number = 0.5) {
    const node = this.flattenNodes().find((n) => n.id === nodeId);
    if (!node) return;
    // 使用逻辑尺寸计算，因为transform应用在scale之前
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    const scale = this.targetTransform.scale;
    this.targetTransform.x = width * xRatio - (node.x + node.width / 2) * scale;
    this.targetTransform.y = height * yRatio - (node.y + node.height / 2) * scale;
    this.startAnimation();
  }

  /**
   * 帧率无关的指数跟随。视口平移/缩放走同一套 k，
   * 缩放走对数空间，否则放大和缩小的手感不对称。
   */
  private startAnimation() {
    if (prefersReducedMotion() || this.disposed) {
      this.settle();
      return;
    }
    if (this.rafId !== null) return;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private settle() {
    this.transform = { ...this.targetTransform };
    this.syncHoverProgress(1);
    this.draw();
  }

  private syncHoverProgress(step: number) {
    this.hoverProgress.clear();
    if (this.hoveredNodeId) {
      this.hoverProgress.set(this.hoveredNodeId, step);
    }
  }

  private tick = (now: number) => {
    this.rafId = null;
    // dt 上限 1/30s：切标签页回来时不要一帧跳完
    const dt = Math.min(Math.max(now - this.lastFrameTime, 0) / 1000, 1 / 30);
    this.lastFrameTime = now;

    const k = followRate.viewport;
    const from = Math.log(this.transform.scale);
    const to = Math.log(this.targetTransform.scale);

    this.transform.x = followTo(this.transform.x, this.targetTransform.x, k, dt);
    this.transform.y = followTo(this.transform.y, this.targetTransform.y, k, dt);
    this.transform.scale = Math.exp(followTo(from, to, k, dt));

    const done =
      Math.abs(this.transform.x - this.targetTransform.x) < 0.1 &&
      Math.abs(this.transform.y - this.targetTransform.y) < 0.1 &&
      Math.abs(from - to) < 0.0005;
    if (done) {
      this.transform.x = this.targetTransform.x;
      this.transform.y = this.targetTransform.y;
      this.transform.scale = this.targetTransform.scale;
    }

    let hoverSettled = true;
    for (const node of this.flattenNodes()) {
      const current = this.hoverProgress.get(node.id) ?? 0;
      const target = node.id === this.hoveredNodeId ? 1 : 0;
      if (Math.abs(current - target) < 0.002) {
        if (target === 0) this.hoverProgress.delete(node.id);
        else this.hoverProgress.set(node.id, target);
        continue;
      }
      hoverSettled = false;
      this.hoverProgress.set(
        node.id,
        followTo(current, target, followRate.hover, dt)
      );
    }

    this.draw();

    if (!done || !hoverSettled) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  /** 释放动画循环，组件卸载时必须调用 */
  dispose() {
    this.disposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeTimer !== null) {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
  }
}
