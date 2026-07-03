'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { useInventorySummary } from '../hooks/use-reports';

const PERIOD_TABS = [
  { id: '10', label: 'Top 10' },
  { id: '20', label: 'Top 20' },
  { id: 'all', label: 'Todo' },
];

export function StockChart() {
  const { data, isLoading } = useInventorySummary();
  const [period, setPeriod] = useState('10');

  if (isLoading) {
    return <div className="animate-pulse h-[340px] bg-[var(--surface-2)] rounded-[12px]" />;
  }

  if (!data?.products?.length) {
    return <p className="text-[var(--muted)]">No stock data available</p>;
  }

  const limit = period === 'all' ? data.products.length : parseInt(period);
  const chartData = data.products
    .sort((a, b) => a.totalStock - b.totalStock)
    .slice(0, limit)
    .map((p) => ({
      name: p.sku,
      stock: p.totalStock,
      threshold: p.stockThreshold,
      isLow: p.isLowStock,
    }));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--fg)]">Stock por Producto</h3>
        <div className="flex gap-1 bg-[var(--surface-2)] rounded-lg p-0.5">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                period === tab.id
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.008 260)" strokeOpacity={0.5} vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fill: 'oklch(58% 0.012 260)', fontSize: 10 }}
            axisLine={{ stroke: 'oklch(22% 0.008 260)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'oklch(58% 0.012 260)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(16% 0.008 260)',
              border: '1px solid oklch(68% 0.19 55 / 0.3)',
              borderRadius: '8px',
              color: 'oklch(96% 0.004 260)',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            cursor={{ fill: 'oklch(20% 0.008 260)', opacity: 0.3 }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'oklch(58% 0.012 260)', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="stock" name="Stock Actual" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isLow ? 'oklch(68% 0.16 25)' : 'oklch(68% 0.19 55)'}
              />
            ))}
          </Bar>
          <Bar dataKey="threshold" name="Umbral" fill="oklch(35% 0.008 260)" radius={[4, 4, 0, 0]} opacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
