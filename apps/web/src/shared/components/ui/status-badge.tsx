import { Badge } from './badge';
import { StockStatus, getStockStatusLabel } from '@/shared/lib/stock-utils';

interface StatusBadgeProps {
  status: StockStatus;
  showLabel?: boolean;
  className?: string;
}

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3 h-3"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
      clipRule="evenodd"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3 h-3"
  >
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

export function StatusBadge({ status, showLabel = true, className = '' }: StatusBadgeProps) {
  const config: Record<
    StockStatus,
    { variant: 'success' | 'warning' | 'danger' | 'neutral'; icon?: React.ReactNode }
  > = {
    normal: { variant: 'success' },
    low: { variant: 'warning', icon: <WarningIcon /> },
    out: { variant: 'danger' },
    expiring: { variant: 'warning', icon: <ClockIcon /> },
  };

  const { variant, icon } = config[status];

  return (
    <Badge variant={variant} icon={icon} className={className}>
      {showLabel ? getStockStatusLabel(status) : null}
    </Badge>
  );
}
