import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'oferta' | 'mais_vendido' | 'promocao' | 'novo' | 'category' | 'discount' | 'ghost';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'oferta',
  className = '',
  icon
}) => {
  const styles = {
    oferta: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20',
    mais_vendido: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20',
    promocao: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm',
    novo: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm',
    category: 'bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 border border-orange-200/50 dark:border-zinc-700',
    discount: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
    ghost: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-none ${styles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
