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
    bg-[var(--surface)]
    border border-[var(--border)] rounded-lg
    text-[var(--fg)]
    transition-all duration-200 ease-out
    focus:border-[var(--accent)]
    focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-0
    hover:border-[var(--border-hover)]
    appearance-none cursor-pointer
  `;

  const errorStyles = error
    ? 'border-danger-600 focus:border-danger-500 focus:ring-danger-600'
    : '';

  const disabledStyles = props.disabled
    ? 'bg-surface-200 cursor-not-allowed opacity-60'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-800 mb-2">
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
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-500 group-focus-within:text-[var(--accent)] transition-colors duration-200">
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
      {error && <p className="mt-2 text-sm text-danger-700">{error}</p>}
      {!error && helperText && (
        <p className="mt-2 text-sm text-surface-600">{helperText}</p>
      )}
    </div>
  );
}
