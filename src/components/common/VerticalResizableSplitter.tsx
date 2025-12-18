import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icons } from '@/components/icons/Icons';

interface VerticalResizableSplitterProps {
  ratio: number;
  onRatioChange: (newRatio: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  minRatio?: number;
  maxRatio?: number;
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export const VerticalResizableSplitter: React.FC<VerticalResizableSplitterProps> = ({
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onDragStart?.();

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      const handleMouseMove = (e: MouseEvent) => {
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
    },
    [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, containerRef]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
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
    },
    [minRatio, maxRatio, onRatioChange, onDragStart, onDragEnd, containerRef]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative flex-shrink-0 ${isCollapsed ? 'h-0' : 'h-2'} flex items-center justify-center group z-10 cursor-row-resize select-none bg-transparent ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Pill Handle Style */}
      {!isCollapsed && (
        <div
          className={`h-1 w-8 rounded-full transition-colors duration-200 ${
            isDragging ? 'bg-primary' : 'bg-border dark:bg-border-dark group-hover:bg-primary'
          }`}
        />
      )}

      {/* Collapse/Expand Button */}
      {onCollapse && (
        <button
          className={`absolute z-20 w-6 h-6 rounded-md bg-surface/90 border border-border shadow-sm flex items-center justify-center text-surface-onSurface transition-opacity duration-200 hover:bg-surface-variant focus:opacity-100 active:scale-95
            left-1/3
            ${isCollapsed ? 'opacity-100 mb-10' : 'opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100'}`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onCollapse();
          }}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <Icons.UpArrow /> : <Icons.DownArrow />}
        </button>
      )}
    </div>
  );
};
