import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'canvasControl' | 'iconButton';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'rounded-m3-medium font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  const variantClasses = {
    filled:
      'bg-primary text-primary-onPrimary/80 hover:bg-primary/90 hover:shadow-m3-1 active:shadow-none font-semibold',
    outlined:
      'border-2 border-primary text-primary-onPrimary/80 hover:bg-primary-container hover:border-primary font-semibold',
    text: 'text-primary hover:bg-primary-container font-semibold',
    canvasControl: 'border-2 border-secondary text-secondary-onSecondary/80 hover:bg-secondary-container hover:border-secondary font-semibold',
    iconButton: 'bg-surface/80 border shadow-sm flex items-center justify-center text-onSurface transition-opacity duration-200 hover:bg-surface focus:opacity-100 active:scale-95',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // iconButton 变体的尺寸类
  const iconButtonSizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base',
  };

  const appliedSizeClasses = variant === 'iconButton' ? iconButtonSizeClasses[size] : sizeClasses[size];

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${appliedSizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
