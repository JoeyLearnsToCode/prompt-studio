import React, { useState, useRef, useCallback, useEffect } from 'react';

interface VerticalResizableSplitterProps {
  /** 当前高度比例(0-1) */
  ratio: number;
  
  /** 比例变化回调 */
  onRatioChange: (newRatio: number) => void;
  
  /** 拖动开始回调 */
  onDragStart?: () => void;
  
  /** 拖动结束回调 */
  onDragEnd?: () => void;
  
  /** 最小比例 */
  minRatio?: number;
  
  /** 最大比例 */
  maxRatio?: number;
  
  /** 可选：自定义样式类名 */
  className?: string;
  
  /** 容器ref，用于计算相对位置 */
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * 垂直方向的可拖动分隔符组件
 * 用于调整上下两个面板的高度比例
 */
export const VerticalResizableSplitter: React.FC<VerticalResizableSplitterProps> = ({
  ratio,
  onRatioChange,
  onDragStart,
  onDragEnd,
  minRatio = 0.2,
  maxRatio = 0.8,
  className = '',
  containerRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStart?.();

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      // 使用requestAnimationFrame确保60fps流畅度
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const relativeY = e.clientY - containerRect.top;
        const newRatio = relativeY / containerRect.height;
        const clampedRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));
        onRatioChange(clampedRatio);
      });
    };

    const handleMouseUp = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
      onDragEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, containerRef]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStart?.();

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const handleTouchMove = (e: TouchEvent) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const relativeY = touch.clientY - containerRect.top;
        const newRatio = relativeY / containerRect.height;
        const clampedRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));
        onRatioChange(clampedRatio);
      });
    };

    const handleTouchEnd = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      setIsDragging(false);
      onDragEnd?.();
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, containerRef]);

  // 组件卸载时清理RAF
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative flex-shrink-0 h-1 bg-surface-variant hover:bg-primary transition-colors duration-200 cursor-row-resize select-none ${
        isDragging ? 'bg-primary' : ''
      } ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        cursor: 'row-resize',
      }}
    >
      {/* 扩大点击热区 */}
      <div
        className="absolute inset-x-0 -top-2 -bottom-2"
        style={{
          cursor: 'row-resize',
        }}
      />
    </div>
  );
};
