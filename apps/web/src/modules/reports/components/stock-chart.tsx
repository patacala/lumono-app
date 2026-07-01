'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useInventorySummary } from '../hooks/use-reports';

export function StockChart() {
  const { data, isLoading } = useInventorySummary();

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded" />;
  }

  if (!data?.products?.length) {
    return <p className="text-gray-500">No stock data available</p>;
  }

  const chartData = data.products
    .sort((a, b) => a.totalStock - b.totalStock)
    .slice(0, 20)
    .map((p) => ({
      name: p.sku,
      stock: p.totalStock,
      threshold: p.stockThreshold,
      isLow: p.isLowStock,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Stock Levels by Product</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stock" name="Current Stock">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isLow ? '#ef4444' : '#3b82f6'}
              />
            ))}
          </Bar>
          <Bar dataKey="threshold" name="Threshold" fill="#fbbf24" opacity={0.5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
