import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 ease-out whitespace-nowrap
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:opacity-90
  `;

  const variantStyles = {
    primary: `
      bg-[var(--accent)] text-[oklch(12%_0.02_55)]
      hover:bg-[oklch(72%_0.19_55)]
      focus-visible:ring-[var(--accent)]
    `,
    secondary: `
      bg-[var(--surface-2)] text-[var(--fg)]
      border border-[var(--border)]
      hover:bg-[var(--surface-3)] hover:border-[var(--border-hover)]
      focus-visible:ring-[var(--border)]
    `,
    danger: `
      bg-danger-600 text-white
      hover:bg-danger-500
      focus-visible:ring-danger-500
    `,
    success: `
      bg-success-600 text-white
      hover:bg-success-500
      focus-visible:ring-success-500
    `,
    warning: `
      bg-warning-600 text-white
      hover:bg-warning-500
      focus-visible:ring-warning-500
    `,
    info: `
      bg-info-600 text-white
      hover:bg-info-500
      focus-visible:ring-info-500
    `,
    ghost: `
      bg-transparent text-[var(--fg-secondary)]
      border border-[var(--border)]
      hover:bg-[var(--surface-2)] hover:text-[var(--fg)]
      focus-visible:ring-[var(--border)]
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-[12px] font-medium min-h-[36px]',
    lg: 'px-6 py-3 text-sm min-h-[44px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
}
