import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-surface-200/50 ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ children, className = '' }: TableProps) {
  return (
    <thead
      className={`
        bg-gradient-to-r from-surface-50/80 to-surface-100/50
        backdrop-blur-sm
        ${className}
      `}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={`bg-white/50 divide-y divide-surface-200/40 ${className}`}>
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
        transition-all duration-200 ease-out
        hover:bg-primary-50/30 hover:backdrop-blur-xs
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
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHeader({
  children,
  className = '',
  sortable = false,
  sorted = null,
  onSort,
}: TableHeaderProps) {
  return (
    <th
      className={`
        px-6 py-4 text-left text-xs font-semibold text-surface-600
        uppercase tracking-wider
        ${sortable ? 'cursor-pointer select-none hover:text-primary-600 transition-colors duration-200' : ''}
        ${className}
      `}
      onClick={sortable && onSort ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span
            className={`
              transition-all duration-200
              ${sorted ? 'text-primary-500' : 'text-surface-400'}
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

export function TableCell({ children, className = '' }: TableProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-surface-800 ${className}`}>
      {children}
    </td>
  );
}

export function TableEmpty({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <div className="text-surface-500 flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-surface-300"
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

