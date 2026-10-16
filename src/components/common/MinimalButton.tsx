import React, { forwardRef } from 'react';

export type ButtonVariant = 'default' | 'ghost' | 'danger' | 'primary';

interface MinimalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const MinimalButton = forwardRef<HTMLButtonElement, MinimalButtonProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    // 手感：按下 90ms（跟手），松开走 160ms 的软着陆 —— 按压缩放必须被过渡覆盖，否则是硬切
    // 焦点环取代 focus:outline-none，键盘可达性不能被视觉统一牺牲
    const baseClasses =
      'inline-flex items-center justify-center rounded-sm font-medium outline-none ' +
      'transition-[transform,background-color,color,border-color,box-shadow,opacity] ' +
      'duration-fast ease-out-expo ' +
      // 油墨压进纸面：按下时下沉 1px 并收掉阴影，硬边阴影这套语法才自洽
      'active:duration-instant active:translate-x-px active:translate-y-px active:shadow-none ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 ' +
      'focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1 ' +
      'focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark';

    const variantClasses = {
      // 默认: 登记卡上的一枚框线按钮 —— 纸底 + 细框线，靠框线而不是阴影立起来
      default:
        'bg-surface dark:bg-surface-variantDark border border-border dark:border-border-dark ' +
        'text-surface-onSurface dark:text-surface-onSurfaceDark ' +
        'hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark',

      // 幽灵按钮: 透明底, 无边框, 淡墨字/图标. 用于低优先级/辅助操作 (导航, 工具栏图标)
      ghost:
        'bg-transparent text-surface-onVariant dark:text-surface-onVariantDark ' +
        'hover:text-primary dark:hover:text-primary-darkAccent hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark border border-transparent',

      // 主操作: 盖一枚胭脂印章。全站只有「保存新版本」这类唯一主操作能用
      primary:
        'bg-primary hover:bg-primary-hover text-primary-onPrimary border border-primary',

      // 危险操作: 只用框线 + 语义红文字，不铺红底。
      // 语义红比印章色更深更褐，两种红只在"细线 vs 实底"上相遇，不会混淆
      danger:
        'bg-transparent text-error dark:text-error-darkAccent border border-error/50 ' +
        'hover:bg-error/10 dark:hover:bg-error/20',
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
