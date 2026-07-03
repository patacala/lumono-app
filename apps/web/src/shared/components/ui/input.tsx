import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const baseInputStyles = `
    block w-full px-4 py-2.5 text-sm
    bg-[var(--surface)]
    border border-[var(--border)] rounded-lg
    text-[var(--fg)]
    placeholder:text-[var(--muted)]
    transition-all duration-200 ease-out
    focus:border-[oklch(68%_0.19_55_/_0.45)]
    focus:ring-1 focus:ring-[oklch(68%_0.19_55_/_0.45)] focus:ring-offset-0
    hover:border-[var(--border-hover)]
  `;

  const errorStyles = error
    ? 'border-danger-600 focus:border-danger-500 focus:ring-danger-600'
    : '';

  const disabledStyles = props.disabled
    ? 'bg-[var(--surface-2)] cursor-not-allowed opacity-60'
    : '';

  const iconPadding = `${leftIcon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors duration-200">
            {leftIcon}
          </div>
        )}
        <input
          className={`${baseInputStyles} ${errorStyles} ${disabledStyles} ${iconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors duration-200">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-700">{error}</p>}
      {!error && helperText && (
        <p className="mt-2 text-sm text-[var(--muted)]">{helperText}</p>
      )}
    </div>
  );
}
