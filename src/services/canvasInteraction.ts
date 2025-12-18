/**
 * Canvas 交互服务
 * 处理鼠标、触摸、滚轮等交互事件
 */

import { CanvasRenderer } from './canvasRenderer';

export class CanvasInteraction {
  private renderer: CanvasRenderer;
  private canvas: HTMLCanvasElement;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private globalMouseUpHandler: ((e: MouseEvent) => void) | null = null;

  private onNodeClick?: (nodeId: string) => void;

  constructor(
    renderer: CanvasRenderer,
    canvas: HTMLCanvasElement,
    onNodeClick?: (nodeId: string) => void
  ) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.onNodeClick = onNodeClick;

    this.attachEventListeners();
  }

  /**
   * 附加事件监听器
   */
  private attachEventListeners() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel);

    // 触摸事件（移动端）
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  /**
   * 鼠标按下
   */
  private handleMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检测节点点击
    const nodeId = this.renderer.hitTest(x, y);
    if (nodeId && this.onNodeClick) {
      this.onNodeClick(nodeId);
      this.renderer.selectNode(nodeId);
      return;
    }

    // 开始拖拽
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.canvas.style.cursor = 'grabbing';

    // 添加全局鼠标移动和释放事件监听器，确保即使鼠标移出canvas也能继续拖动
    this.globalMouseUpHandler = this.handleGlobalMouseUp.bind(this);
    document.addEventListener('mousemove', this.handleGlobalMouseMove, true);
    document.addEventListener('mouseup', this.globalMouseUpHandler, true);
  };

  /**
   * 鼠标移动
   */
  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    this.renderer.pan(dx, dy);

    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  /**
   * 全局鼠标移动（处理鼠标在canvas外部时的拖动）
   */
  private handleGlobalMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    this.renderer.pan(dx, dy);

    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  /**
   * 鼠标释放
   */
  private handleMouseUp = () => {
    this.handleGlobalMouseUp();
  };

  /**
   * 全局鼠标释放（处理鼠标在canvas外部时的释放）
   */
  private handleGlobalMouseUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.canvas.style.cursor = 'default';

    // 移除全局事件监听器
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    if (this.globalMouseUpHandler) {
      document.removeEventListener('mouseup', this.globalMouseUpHandler);
      this.globalMouseUpHandler = null;
    }
  };

  /**
   * 滚轮缩放
   */
  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.renderer.zoom(delta, centerX, centerY);
  };

  /**
   * 触摸开始
   */
  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.isDragging = true;
    }
  };

  /**
   * 触摸移动
   */
  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && this.isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - this.dragStartX;
      const dy = touch.clientY - this.dragStartY;

      this.renderer.pan(dx, dy);

      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
    }
  };

  /**
   * 触摸结束
   */
  private handleTouchEnd = () => {
    this.isDragging = false;
  };

  /**
   * 销毁
   */
  destroy() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);

    // 确保移除全局事件监听器
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    if (this.globalMouseUpHandler) {
      document.removeEventListener('mouseup', this.globalMouseUpHandler);
      this.globalMouseUpHandler = null;
    }
  }
}
