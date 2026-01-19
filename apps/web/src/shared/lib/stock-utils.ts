export type StockStatus = 'normal' | 'low' | 'out' | 'expiring';

export function isWithinDays(date: Date | string, days: number): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  return daysDiff >= 0 && daysDiff <= days;
}

export function isExpired(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.getTime() < new Date().getTime();
}

export function getStockStatus(
  stock: number,
  threshold: number,
  expirationDate?: string | Date
): StockStatus {
  if (stock === 0) return 'out';
  if (expirationDate && isWithinDays(expirationDate, 1)) return 'expiring';
  if (stock < threshold) return 'low';
  return 'normal';
}

export function getStockStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    normal: 'Normal',
    low: 'Stock Bajo',
    out: 'Sin Stock',
    expiring: 'Por Vencer',
  };
  return labels[status];
}

export function getRowClassName(status: StockStatus): string {
  switch (status) {
    case 'expiring':
      return 'bg-red-50 hover:bg-red-100';
    case 'out':
      return 'bg-surface-50';
    default:
      return '';
  }
}

export function getStockCellClassName(stock: number, threshold: number): string {
  if (stock > 0 && stock < threshold) {
    return 'bg-yellow-100';
  }
  return '';
}

export function formatExpirationDate(date: string | Date | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getDaysUntilExpiration(date: string | Date): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
