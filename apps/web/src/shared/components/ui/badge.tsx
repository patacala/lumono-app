import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'attention' | 'accent' | 'ok' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    neutral: 'bg-[var(--status-neutral)] text-[oklch(70%_0.01_260)] border-[oklch(24%_0.008_260)]',
    attention: 'bg-[var(--status-attention)] text-[oklch(75%_0.01_260)] border-[oklch(28%_0.01_260)]',
    accent: 'bg-[var(--accent-dim)] text-[oklch(78%_0.06_55)] border-[oklch(68%_0.19_55_/_0.25)]',
    ok: 'bg-[var(--status-ok)] text-[oklch(72%_0.01_260)] border-[oklch(26%_0.01_260)]',
    critical: 'bg-[var(--status-critical)] text-[oklch(68%_0.01_260)] border-[oklch(22%_0.01_260)] font-semibold',
    // Legacy mappings
    primary: 'bg-[var(--accent-dim)] text-[oklch(78%_0.06_55)] border-[oklch(68%_0.19_55_/_0.25)]',
    success: 'bg-[var(--status-ok)] text-[oklch(72%_0.01_260)] border-[oklch(26%_0.01_260)]',
    warning: 'bg-[var(--status-attention)] text-[oklch(75%_0.01_260)] border-[oklch(28%_0.01_260)]',
    danger: 'bg-[var(--status-critical)] text-[oklch(68%_0.01_260)] border-[oklch(22%_0.01_260)] font-semibold',
    info: 'bg-[var(--status-neutral)] text-[oklch(70%_0.01_260)] border-[oklch(24%_0.008_260)]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-[8px] py-[3px] text-[10px] gap-1',
    lg: 'px-3 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-[5px] border
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && <span className="w-[5px] h-[5px] rounded-full bg-current opacity-[0.55] flex-shrink-0" />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
