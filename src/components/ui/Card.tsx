import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-orange-100/80 dark:border-zinc-800 rounded-[20px] p-5 shadow-sm shadow-orange-950/5 transition-all duration-300 ${
        hoverEffect ? 'hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
