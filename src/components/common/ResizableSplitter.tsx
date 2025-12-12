import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icons } from '@/components/icons/Icons';

interface ResizableSplitterProps {
  /** 当前宽度比例(0-1) */
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

  /** 容器引用，用于计算相对宽度 */
  containerRef?: React.RefObject<HTMLElement>;

  /** 是否已折叠 */
  isCollapsed?: boolean;

  /** 折叠状态切换回调 */
  onCollapse?: () => void;
}

/**
 * 可拖动的面板分隔符组件
 * 用于调整主画布和右侧面板的宽度比例
 */
export const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  ratio: _ratio,
  onRatioChange,
  onDragStart,
  onDragEnd,
  minRatio = 0.2,
  maxRatio = 0.8,
  className = '',
  containerRef,
  isCollapsed,
  onCollapse,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStart?.();

    const startX = e.clientX;
    const startRatio = _ratio;

    const handleMouseMove = (e: MouseEvent) => {
      // 使用requestAnimationFrame确保60fps流畅度
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const totalWidth = containerRef?.current?.clientWidth || window.innerWidth;
        const newRatio = startRatio + deltaX / totalWidth;
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
  }, [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, _ratio]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // e.preventDefault();
    setIsDragging(true);
    onDragStart?.();

    const startX = e.touches[0].clientX;
    const startRatio = _ratio;

    const handleTouchMove = (e: TouchEvent) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const totalWidth = containerRef?.current?.clientWidth || window.innerWidth;
        const newRatio = startRatio + deltaX / totalWidth;
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
  }, [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, _ratio]);

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
      className={`relative flex-shrink-0 w-1 bg-surface-variant hover:bg-primary transition-colors duration-200 cursor-col-resize select-none flex flex-col justify-center items-center group z-10 ${
        isDragging ? 'bg-primary' : ''
      } ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        cursor: 'col-resize',
      }}
    >
      {/* 扩大点击热区 */}
      <div
        className="absolute inset-y-0 -left-2 -right-2"
        style={{
          cursor: 'col-resize',
        }}
      />

      {/* 折叠/展开按钮 */}
      {onCollapse && (
        <button
          className={`absolute z-20 top-1/4 w-6 h-6 rounded-md bg-surface/80 border shadow-sm flex items-center
            justify-center text-onSurface transition-opacity duration-200 hover:bg-surface focus:opacity-100 active:scale-95
            ${isCollapsed ? 'opacity-100 mr-10' : 'opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100'}`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onCollapse();
          }}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <Icons.LeftArrow /> : <Icons.RightArrow />}
        </button>
      )}
    </div>
  );
};
