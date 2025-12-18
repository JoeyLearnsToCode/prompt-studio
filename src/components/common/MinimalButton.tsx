import React, { forwardRef } from 'react';

export type ButtonVariant = 'default' | 'ghost' | 'danger';

interface MinimalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const MinimalButton = forwardRef<HTMLButtonElement, MinimalButtonProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg transition-colors duration-200 font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variantClasses = {
      // 默认按钮: 实心灰/米色, 无边框, 深色字.
      default:
        'bg-surface-containerHighest/60 hover:bg-surface-containerHighest dark:bg-zinc-700 dark:hover:bg-zinc-600 text-surface-onSurface border border-transparent',

      // 幽灵按钮: 透明底, 无边框, 灰色字/图标. 用于低优先级/辅助操作 (导航, 工具栏图标)
      ghost:
        'bg-transparent text-surface-onVariant hover:text-primary border border-transparent',

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
