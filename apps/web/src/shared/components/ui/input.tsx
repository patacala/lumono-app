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
    bg-white/70 backdrop-blur-sm
    border border-surface-200/60 rounded-xl
    placeholder:text-surface-400
    transition-all duration-200 ease-out
    focus:bg-white/90 focus:border-primary-300
    focus:ring-2 focus:ring-primary-100 focus:ring-offset-0
    hover:border-surface-300
  `;

  const errorStyles = error
    ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100'
    : '';

  const disabledStyles = props.disabled
    ? 'bg-surface-100/50 cursor-not-allowed opacity-60'
    : '';

  const iconPadding = `${leftIcon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200">
            {leftIcon}
          </div>
        )}
        <input
          className={`${baseInputStyles} ${errorStyles} ${disabledStyles} ${iconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {!error && helperText && (
        <p className="mt-2 text-sm text-surface-500">{helperText}</p>
      )}
    </div>
  );
}
