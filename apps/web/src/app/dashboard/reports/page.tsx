'use client';

import { useInventorySummary, downloadExcelReport } from '@/modules/reports/hooks/use-reports';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { StockChart } from '@/modules/reports/components/stock-chart';
import { StockValueChart } from '@/modules/reports/components/stock-value-chart';

export default function ReportsPage() {
  const { data: summary } = useInventorySummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Reportes y Analitica</h1>
          <p className="mt-1 text-sm text-surface-500">
            Vision general del sistema de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => downloadExcelReport('inventory')}
          >
            Exportar Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadExcelReport('movements')}
          >
            Exportar Movimientos
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-primary-600">
              {summary?.totalProducts || 0}
            </div>
            <div className="text-sm font-medium text-surface-600 mt-2">Total Productos</div>
          </CardBody>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm">
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-success-600">
              {summary?.lowStockCount || 0}
            </div>
            <div className="text-sm font-medium text-surface-600 mt-2">Stock Bajo</div>
          </CardBody>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm">
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-info-600">
              ${(summary?.totalStockValue || 0).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-surface-600 mt-2">Valor Total Stock</div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardBody className="p-2">
            <StockChart />
          </CardBody>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm">
          <CardBody className="p-2">
            <StockValueChart />
          </CardBody>
        </Card>
      </div>

      {/* Product Detail Table */}
      {summary?.products && summary.products.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Detalle de Productos</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Umbral</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {summary.products.map(product => (
                    <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-mono text-surface-700">{product.sku}</td>
                      <td className="px-6 py-3 text-sm font-medium text-surface-900">{product.name}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-surface-900">
                        {product.totalStock} {product.unit}
                      </td>
                      <td className="px-6 py-3 text-sm text-right text-surface-500">{product.stockThreshold}</td>
                      <td className="px-6 py-3 text-sm text-right text-surface-900">${product.stockValue.toLocaleString()}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.isLowStock
                            ? 'bg-danger-100 text-danger-700'
                            : 'bg-success-100 text-success-700'
                        }`}>
                          {product.isLowStock ? 'Bajo' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
