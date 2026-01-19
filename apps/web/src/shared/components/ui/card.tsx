import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  animate?: boolean;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
  animate = false,
}: CardProps) {
  const variantStyles = {
    default: `
      glass-card rounded-2xl
      shadow-glass
    `,
    elevated: `
      bg-white/90 backdrop-blur-lg rounded-2xl
      shadow-elevated border border-white/20
    `,
    bordered: `
      bg-white/80 backdrop-blur-sm rounded-2xl
      border border-surface-200/60 shadow-soft
    `,
  };

  const hoverStyles = hover
    ? 'hover:shadow-glass-lg hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer'
    : 'transition-all duration-300 ease-out';

  const animateStyles = animate ? 'animate-fade-in-up' : '';

  return (
    <div className={`${variantStyles[variant]} ${hoverStyles} ${animateStyles} ${className}`}>
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div
      className={`
        px-6 py-5 border-b border-surface-200/50
        bg-gradient-to-r from-surface-50/50 to-transparent
        rounded-t-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardSectionProps) {
  return (
    <h3 className={`text-lg font-semibold text-surface-900 ${className}`}>{children}</h3>
  );
}

export function CardDescription({ children, className = '' }: CardSectionProps) {
  return <p className={`text-sm text-surface-500 mt-1 ${className}`}>{children}</p>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div
      className={`
        px-6 py-4 border-t border-surface-200/50
        bg-gradient-to-r from-surface-50/30 to-transparent
        rounded-b-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}
