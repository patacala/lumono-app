import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
}: BadgeProps) {
  const variantStyles = {
    primary: `
      bg-primary-100/80 backdrop-blur-xs
      text-primary-700 border-primary-200/50
      shadow-sm
    `,
    success: `
      bg-success-100/80 backdrop-blur-xs
      text-success-700 border-success-200/50
      shadow-sm
    `,
    warning: `
      bg-warning-100/80 backdrop-blur-xs
      text-warning-700 border-warning-200/50
      shadow-sm
    `,
    danger: `
      bg-danger-100/80 backdrop-blur-xs
      text-danger-700 border-danger-200/50
      shadow-sm
    `,
    info: `
      bg-info-100/80 backdrop-blur-xs
      text-info-700 border-info-200/50
      shadow-sm
    `,
    neutral: `
      bg-surface-100/80 backdrop-blur-xs
      text-surface-700 border-surface-200/50
      shadow-sm
    `,
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

