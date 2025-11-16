import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text';
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
    'rounded-m3-medium font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    filled:
      'bg-primary text-onPrimary hover:bg-primary-container hover:shadow-m3-1 active:shadow-none',
    outlined:
      'border-2 border-primary text-primary hover:bg-primary-container hover:border-primary-container',
    text: 'text-primary hover:bg-primary-container',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
