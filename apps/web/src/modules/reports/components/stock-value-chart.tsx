'use client';

import {
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useInventorySummary } from '../hooks/use-reports';
import { ORANGE_SCALE, chartTooltip, CHART_INK, CHART_MUTED } from '@/shared/lib/chart-theme';

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
              <Cell key={`cell-${index}`} fill={ORANGE_SCALE[index % ORANGE_SCALE.length]} />
            ))}
            {/* Center label anchored to the actual donut center */}
            <Label
              position="center"
              content={(props: any) => {
                const { cx, cy } = props.viewBox as { cx: number; cy: number };
                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={CHART_MUTED}
                      style={{ fontSize: '10px', letterSpacing: '0.05em' }}
                    >
                      TOTAL
                    </text>
                    <text
                      x={cx}
                      y={cy + 11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={CHART_INK}
                      style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}
                    >
                      ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </text>
                  </g>
                );
              }}
            />
          </Pie>
          <Tooltip
            {...chartTooltip}
            formatter={(value: number) => `$${value.toLocaleString()}`}
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
