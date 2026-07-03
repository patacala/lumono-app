import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`min-w-full ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-[var(--surface-2)] ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={`${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  onClick,
}: TableProps & { onClick?: () => void }) {
  return (
    <tr
      className={`
        transition-colors duration-200
        hover:bg-[oklch(16%_0.006_260)]
        border-b border-[oklch(18%_0.006_260)] last:border-b-0
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const headerAlignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const headerFlexAlignClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

export function TableHeader({
  children,
  className = '',
  align = 'left',
  sortable = false,
  sorted = null,
  onSort,
}: TableHeaderProps) {
  return (
    <th
      className={`
        px-[14px] py-[10px] text-[10px] font-semibold text-[var(--muted)]
        uppercase tracking-[0.05em]
        ${headerAlignClass[align]}
        ${sortable ? 'cursor-pointer select-none hover:text-[var(--accent)] transition-colors duration-200' : ''}
        ${className}
      `}
      onClick={sortable && onSort ? onSort : undefined}
    >
      <div className={`flex items-center gap-2 ${headerFlexAlignClass[align]}`}>
        {children}
        {sortable && (
          <span
            className={`
              transition-all duration-200
              ${sorted ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}
            `}
          >
            {sorted === 'asc' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {sorted === 'desc' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {!sorted && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export function TableCell({ children, className = '', colSpan }: TableProps & { colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={`px-[14px] py-[11px] whitespace-nowrap text-sm text-[var(--fg-secondary)] ${className}`}>
      {children}
    </td>
  );
}

export function TableEmpty({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-[14px] py-16 text-center">
        <div className="text-[var(--muted)] flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-[var(--muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          {children}
        </div>
      </td>
    </tr>
  );
}
