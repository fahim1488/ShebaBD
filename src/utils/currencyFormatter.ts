/**
 * currencyFormatter.ts - Format currency amounts for Bangladeshi Taka (BDT).
 */
export function formatBDT(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '৳0';
  return `৳${num.toLocaleString('en-BD')}`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}
