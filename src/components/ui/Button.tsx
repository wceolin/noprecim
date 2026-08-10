import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shadow-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 hover:from-orange-700 hover:via-amber-600 hover:to-rose-600 text-white shadow-orange-500/20 shadow-md hover:shadow-lg',
    secondary: 'bg-orange-100 dark:bg-zinc-800 text-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-zinc-700',
    outline: 'border-2 border-orange-200 dark:border-zinc-700 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-800/60',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    ghost: 'text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800 shadow-none'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
