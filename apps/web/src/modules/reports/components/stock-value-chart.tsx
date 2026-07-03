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

const COLORS = [
  'oklch(68% 0.19 55)',    // amber/accent
  'oklch(65% 0.18 145)',   // green
  'oklch(62% 0.20 260)',   // blue
  'oklch(65% 0.18 330)',   // pink
  'oklch(70% 0.15 80)',    // yellow-green
  'oklch(58% 0.20 290)',   // purple
  'oklch(68% 0.15 30)',    // orange
  'oklch(55% 0.18 200)',   // teal
];

export function StockValueChart() {
  const { data, isLoading } = useInventorySummary();

  if (isLoading) {
    return <div className="animate-pulse h-[340px] bg-[var(--surface-2)] rounded-[12px]" />;
  }

  if (!data?.products?.length) {
    return <p className="text-[var(--muted)]">No stock data available</p>;
  }

  const chartData = data.products
    .filter((p) => p.stockValue > 0)
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      value: Math.round(p.stockValue * 100) / 100,
    }));

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
      <h3 className="text-[13px] font-semibold text-[var(--fg)] mb-4">Distribucion de Valor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            innerRadius={65}
            outerRadius={110}
            fill="oklch(68% 0.19 55)"
            dataKey="value"
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* Center label */}
          <text
            x="40%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--muted)]"
            style={{ fontSize: '10px' }}
          >
            Total
          </text>
          <text
            x="40%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--fg)]"
            style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}
          >
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </text>
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: 'oklch(16% 0.008 260)',
              border: '1px solid oklch(68% 0.19 55 / 0.3)',
              borderRadius: '8px',
              color: 'oklch(96% 0.004 260)',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', lineHeight: '22px', paddingLeft: '12px' }}
            formatter={(value: string) => (
              <span style={{ color: 'oklch(72% 0.008 260)' }}>
                {value.length > 18 ? value.substring(0, 18) + '...' : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
