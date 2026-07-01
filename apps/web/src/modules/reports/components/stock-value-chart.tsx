'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useInventorySummary } from '../hooks/use-reports';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function StockValueChart() {
  const { data, isLoading } = useInventorySummary();

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded" />;
  }

  if (!data?.products?.length) {
    return <p className="text-gray-500">No stock data available</p>;
  }

  const chartData = data.products
    .filter((p) => p.stockValue > 0)
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      value: Math.round(p.stockValue * 100) / 100,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Stock Value Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
