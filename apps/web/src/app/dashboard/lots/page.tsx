'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLots, LotCondition } from '@/modules/lots/hooks/use-lots';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/ui/pagination';

const CONDITION_LABELS: Record<LotCondition, string> = {
  GOOD: 'Bueno',
  DAMAGED: 'Danado',
  EXPIRED: 'Vencido',
};

const CONDITION_VARIANTS: Record<LotCondition, 'success' | 'warning' | 'danger'> = {
  GOOD: 'success',
  DAMAGED: 'warning',
  EXPIRED: 'danger',
};

const CONDITION_TABS: (LotCondition | undefined)[] = [undefined, 'GOOD', 'DAMAGED', 'EXPIRED'];

export default function LotsPage() {
  const [page, setPage] = useState(1);
  const [conditionFilter, setConditionFilter] = useState<LotCondition | undefined>();
  const limit = 20;

  const { data, isLoading } = useLots({ page, limit, condition: conditionFilter });
  const lots = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando lotes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lotes</h1>
        <p className="mt-1 text-sm text-gray-500">Trazabilidad de lotes por producto y ubicacion</p>
      </div>

      {/* Condition tabs */}
      <div className="flex gap-2 flex-wrap">
        {CONDITION_TABS.map((condition) => (
          <button
            key={condition || 'ALL'}
            onClick={() => { setConditionFilter(condition); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              conditionFilter === condition
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {condition ? CONDITION_LABELS[condition] : 'Todos'}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicacion</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condicion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricacion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lots.length > 0 ? (
                  lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                        {lot.lotNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{lot.productName}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{lot.productSku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lot.locationName}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold">{lot.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={CONDITION_VARIANTS[lot.condition]}>
                          {CONDITION_LABELS[lot.condition]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lot.expirationDate
                          ? new Date(lot.expirationDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lot.manufacturingDate
                          ? new Date(lot.manufacturingDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No hay lotes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
