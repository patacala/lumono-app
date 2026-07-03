import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'stat';
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
    default: 'bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]',
    elevated: 'bg-[var(--surface-2)] border border-[var(--border)] rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
    bordered: 'bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]',
    stat: 'bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] overflow-hidden',
  };

  const hoverStyles = hover
    ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer'
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
        px-[18px] py-4 border-b border-[var(--border)]
        rounded-t-[12px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`px-[18px] py-[18px] ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardSectionProps) {
  return (
    <h3 className={`text-[13px] font-semibold text-[var(--fg)] ${className}`}>{children}</h3>
  );
}

export function CardDescription({ children, className = '' }: CardSectionProps) {
  return <p className={`text-sm text-[var(--muted)] mt-1 ${className}`}>{children}</p>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div
      className={`
        px-[18px] py-4 border-t border-[var(--border)]
        rounded-b-[12px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
