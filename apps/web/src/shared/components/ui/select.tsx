import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  const baseSelectStyles = `
    block w-full px-4 py-2.5 text-sm
    bg-white/70 backdrop-blur-sm
    border border-surface-200/60 rounded-xl
    transition-all duration-200 ease-out
    focus:bg-white/90 focus:border-primary-300
    focus:ring-2 focus:ring-primary-100 focus:ring-offset-0
    hover:border-surface-300
    appearance-none cursor-pointer
  `;

  const errorStyles = error
    ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100'
    : '';

  const disabledStyles = props.disabled
    ? 'bg-surface-100/50 cursor-not-allowed opacity-60'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          className={`${baseSelectStyles} ${errorStyles} ${disabledStyles} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-all duration-200 group-hover:translate-y-0.5">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {!error && helperText && (
        <p className="mt-2 text-sm text-surface-500">{helperText}</p>
      )}
    </div>
  );
}

