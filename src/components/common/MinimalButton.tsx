import React, { forwardRef } from 'react';

export type ButtonVariant = 'default' | 'ghost' | 'danger';

interface MinimalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const MinimalButton = forwardRef<HTMLButtonElement, MinimalButtonProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    // 手感：按下 90ms（跟手），松开走 160ms 的软着陆 —— 按压缩放必须被过渡覆盖，否则是硬切
    // 焦点环取代 focus:outline-none，键盘可达性不能被视觉统一牺牲
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium outline-none ' +
      'transition-[transform,background-color,color,border-color,box-shadow,opacity] ' +
      'duration-fast ease-out-expo ' +
      'active:duration-instant active:scale-[0.97] ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
      'focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1 ' +
      'focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark';

    const variantClasses = {
      // 默认按钮: 实心灰/米色, 无边框.
      // 修复：暗色模式下使用 variantDark 背景，文字使用 onSurfaceDark 确保高对比度
      default:
        'bg-surface-containerHighest/60 hover:bg-surface-containerHighest dark:bg-surface-variantDark dark:hover:bg-surface-containerHighestDark text-surface-onSurface dark:text-surface-onSurfaceDark border border-transparent',

      // 幽灵按钮: 透明底, 无边框, 灰色字/图标. 用于低优先级/辅助操作 (导航, 工具栏图标)
      ghost:
        'bg-transparent text-surface-onVariant dark:text-surface-onVariantDark hover:text-primary dark:hover:text-primary border border-transparent',

      // 危险操作(轻量): 浅红背景. 用于一般删除
      danger: 'bg-error/10 text-error hover:bg-error/20 border border-transparent',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MinimalButton.displayName = 'MinimalButton';
