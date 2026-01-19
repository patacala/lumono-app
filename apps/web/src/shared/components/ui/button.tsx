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
    relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-out whitespace-nowrap
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    active:scale-[0.98]
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-b from-primary-500 to-primary-600 text-white
      shadow-soft hover:shadow-elevated hover:-translate-y-0.5
      focus-visible:ring-primary-400
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    secondary: `
      bg-white/80 backdrop-blur-sm text-primary-700
      border border-primary-200/50
      shadow-glass-sm hover:shadow-glass hover:bg-white hover:-translate-y-0.5
      focus-visible:ring-primary-300
    `,
    danger: `
      bg-gradient-to-b from-danger-500 to-danger-600 text-white
      shadow-soft hover:shadow-elevated hover:-translate-y-0.5
      focus-visible:ring-danger-400
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    success: `
      bg-gradient-to-b from-success-500 to-success-600 text-white
      shadow-soft hover:shadow-elevated hover:-translate-y-0.5
      focus-visible:ring-success-400
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    warning: `
      bg-gradient-to-b from-warning-500 to-warning-600 text-white
      shadow-soft hover:shadow-elevated hover:-translate-y-0.5
      focus-visible:ring-warning-400
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    info: `
      bg-gradient-to-b from-info-500 to-info-600 text-white
      shadow-soft hover:shadow-elevated hover:-translate-y-0.5
      focus-visible:ring-info-400
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    ghost: `
      bg-transparent text-surface-700
      hover:bg-surface-100/70 hover:backdrop-blur-xs
      focus-visible:ring-surface-400
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2.5 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
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
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
