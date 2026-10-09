import React, { useEffect, useRef, useState } from 'react';

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

interface ScoreRatingProps {
  /** 当前分数，0 表示未评分 */
  value: number;
  /** 拖动过程中的即时反馈，不落库 */
  onScrub?: (value: number) => void;
  /** 松手 / 单击 / 键盘操作：落定，需要落库 */
  onCommit?: (value: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * 1~10 打分控件
 *
 * 交互上只认指针的横坐标，而不是每个格子的 mouseenter —— 手指到哪就到哪，
 * 不会因为快速划过漏掉某个格子。拖动时全部即时响应（1:1 跟手），
 * 只在单击和键盘操作时才走过渡落位。
 */
export const ScoreRating: React.FC<ScoreRatingProps> = ({
  value,
  onScrub,
  onCommit,
  readonly = false,
  disabled = false,
  ariaLabel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  // 逻辑用 ref：pointerup 与 lostpointercapture 会连续触发，只提交一次
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const interactive = !readonly && !disabled;

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const valueFromX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return valueRef.current;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.ceil(ratio * SCORE_MAX)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    trackRef.current?.focus();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 少数浏览器对合成指针事件不支持捕获，退化成只在元素内拖动
    }
    draggingRef.current = true;
    setDragging(true);
    const next = valueFromX(e.clientX);
    valueRef.current = next;
    onScrub?.(next);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const next = valueFromX(e.clientX);
    if (next !== valueRef.current) {
      valueRef.current = next;
      onScrub?.(next);
    }
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    onCommit?.(valueRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;

    let next: number | null = null;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        // 未评分时不越级给分
        if (valueRef.current <= 0) return;
        next = Math.max(SCORE_MIN, valueRef.current - 1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(SCORE_MAX, valueRef.current + 1);
        break;
      case 'Home':
        next = SCORE_MIN;
        break;
      case 'End':
        next = SCORE_MAX;
        break;
      default:
        return;
    }

    e.preventDefault();
    if (next === valueRef.current) return;
    valueRef.current = next;
    onScrub?.(next);
    onCommit?.(next);
  };

  const cells = Array.from({ length: SCORE_MAX }, (_, i) => i + 1);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-valuemin={SCORE_MIN}
      aria-valuemax={SCORE_MAX}
      aria-valuenow={value}
      aria-disabled={!interactive}
      className={`
        relative flex gap-1.5 p-1.5 rounded-xl touch-none select-none outline-none
        ${interactive ? 'cursor-pointer' : 'cursor-default'}
        ${readonly ? 'opacity-60' : ''}
        focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1
        focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface-dark
      `}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={handleKeyDown}
    >
      {cells.map((n) => (
        <div
          key={n}
          className={`
            flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold tabular-nums
            ${dragging ? '' : 'transition-colors duration-fast'}
            ${
              n === value
                ? 'bg-primary text-primary-onPrimary shadow-sm'
                : n < value
                  ? 'bg-primary/20 text-primary dark:text-primary'
                  : 'bg-surface-variant/70 dark:bg-surface-variantDark text-surface-onVariant dark:text-surface-onVariantDark'
            }
          `}
        >
          {n}
        </div>
      ))}
    </div>
  );
};
