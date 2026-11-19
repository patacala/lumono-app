// Shared Recharts theme tokens for the Lumono dark premium design system.
// Centralizes chart color + tooltip styling so every chart reads as one system
// and — critically — tooltip text always wears an ink token, never the series
// color (which is what caused dark-on-dark, unreadable tooltips).

export const CHART_INK = 'oklch(96% 0.004 260)'; // --fg
export const CHART_MUTED = 'oklch(72% 0.008 260)'; // secondary ink

// Sequential single-hue orange ramp (light → dark). Use for magnitude-ordered
// marks (e.g. slices sorted by value): the darkest step reads as the largest.
export const ORANGE_SCALE = [
  'oklch(80% 0.13 70)',
  'oklch(75% 0.16 63)',
  'oklch(70% 0.19 56)',
  'oklch(65% 0.19 50)',
  'oklch(60% 0.18 45)',
  'oklch(55% 0.16 41)',
  'oklch(49% 0.14 38)',
  'oklch(43% 0.12 36)',
];

// Spread onto a Recharts <Tooltip/>. Guarantees a dark surface with light,
// readable text regardless of the series colors.
export const chartTooltip = {
  contentStyle: {
    backgroundColor: 'oklch(16% 0.008 260)',
    border: '1px solid oklch(68% 0.19 55 / 0.3)',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  itemStyle: { color: CHART_INK },
  labelStyle: { color: CHART_MUTED, marginBottom: 2 },
} as const;

// Recessive hover highlight behind bars/marks.
export const chartCursor = { fill: 'oklch(20% 0.008 260)', opacity: 0.3 } as const;
