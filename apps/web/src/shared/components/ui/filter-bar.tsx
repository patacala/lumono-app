interface Filter {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: Filter[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export function FilterBar({ filters, onRemoveFilter, onClearAll }: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div
      className="
        flex items-center gap-3 flex-wrap
        px-4 py-3 rounded-lg
        bg-[var(--surface)] border border-[var(--border)]
      "
    >
      <span className="text-sm font-medium text-surface-600">Active filters:</span>

      {filters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          value={filter.value}
          onRemove={() => onRemoveFilter(filter.key)}
        />
      ))}

      <button
        onClick={onClearAll}
        className="
          text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]
          font-medium ml-2
          transition-colors duration-200
        "
      >
        Clear all
      </button>
    </div>
  );
}

function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="
        inline-flex items-center gap-2
        px-3 py-1.5
        bg-[var(--surface-2)]
        border border-[var(--border)] rounded-full
        text-sm
        transition-all duration-200
        hover:border-[var(--border-hover)]
      "
    >
      <span className="text-surface-600">{label}:</span>
      <span className="font-medium text-surface-800">{value}</span>
      <button
        onClick={onRemove}
        className="
          p-0.5 rounded-full
          text-surface-500 hover:text-surface-900
          hover:bg-surface-300
          transition-all duration-200
        "
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-surface-800 mb-2">{label}</label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            block w-full px-4 py-2.5 text-sm
            bg-[var(--surface)]
            border border-[var(--border)] rounded-lg
            text-[var(--fg)]
            transition-all duration-200 ease-out
            focus:border-[var(--accent)]
            focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-0
            hover:border-[var(--border-hover)]
            appearance-none cursor-pointer
          "
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-500 group-focus-within:text-[var(--accent)] transition-colors duration-200">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
