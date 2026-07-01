'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from './button';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  enableExportCsv?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  enableExportCsv = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const exportCsv = () => {
    const headers = columns.map((col: any) => col.header || col.id || '');
    const rows = table.getFilteredRowModel().rows.map((row) =>
      row.getVisibleCells().map((cell) => {
        const value = cell.getValue();
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : String(value ?? '');
      }),
    );

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="px-4 py-2 border border-surface-200/50 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 text-sm"
        />
        {enableExportCsv && (
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            Exportar CSV
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-200/50 bg-white/70 backdrop-blur-sm shadow-sm">
        <table className="min-w-full divide-y divide-surface-200/50">
          <thead className="bg-surface-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' \u2191'}
                      {header.column.getIsSorted() === 'desc' && ' \u2193'}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-200/30">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-surface-900 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-surface-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-surface-500">
          Mostrando {table.getRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} resultados
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="px-3 py-1 text-sm text-surface-700">
            Pagina {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
