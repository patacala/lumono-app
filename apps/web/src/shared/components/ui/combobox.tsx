'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCreate?: () => void;
  createLabel?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Combobox({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  onCreate,
  createLabel = 'Crear nuevo',
  disabled = false,
  required = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const hasCreateButton = onCreate && (filtered.length === 0);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const selectOption = useCallback(
    (opt: ComboboxOption) => {
      onChange(opt.value);
      setSearch('');
      setIsOpen(false);
    },
    [onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIndex]) {
          selectOption(filtered[highlightIndex]);
        } else if (hasCreateButton) {
          onCreate();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  }

  function handleFocus() {
    if (!disabled) setIsOpen(true);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  }

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

  const disabledStyles = disabled
    ? 'bg-[var(--surface-2)] cursor-not-allowed opacity-60'
    : '';

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            className={`${baseInputStyles} ${errorStyles} ${disabledStyles} pr-16`}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            value={isOpen ? search : (selectedOption?.label || '')}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required && !value}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-0.5">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                tabIndex={-1}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="p-1 text-[var(--muted)] pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg"
          >
            {filtered.map((option, i) => (
              <li
                key={option.value}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  i === highlightIndex
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-[var(--fg)] hover:bg-[var(--surface-2)]'
                } ${option.value === value ? 'font-medium' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                {option.label}
              </li>
            ))}

            {filtered.length === 0 && !hasCreateButton && (
              <li className="px-4 py-3 text-sm text-[var(--muted)] text-center">
                Sin resultados
              </li>
            )}

            {hasCreateButton && (
              <li
                className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors ${
                  filtered.length === 0 && highlightIndex === 0 ? 'bg-[var(--accent)]/5' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onCreate();
                  setIsOpen(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {createLabel}
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-700">{error}</p>}
      {!error && helperText && (
        <p className="mt-2 text-sm text-[var(--muted)]">{helperText}</p>
      )}
    </div>
  );
}
