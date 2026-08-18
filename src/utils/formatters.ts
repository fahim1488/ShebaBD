/**
 * formatters.ts — Number, currency, and text formatting utilities for ShebaBD.
 */

/** Format BDT currency: 1500 → "৳1,500" */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

/** Compact large numbers: 18400 → "18.4K" */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Capitalize first letter: "dhaka" → "Dhaka" */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Title case: "blood_donation" → "Blood Donation" */
export function toTitleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(capitalize)
    .join(' ');
}

/** Truncate long text with ellipsis: "Long text..." */
export function truncate(str: string, maxLength = 100): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/** Get initials from full name: "Fahim Muntasir" → "FM" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

/** Format phone for display: "+8801711000001" → "+880 171-100-0001" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('880')) {
    return `+880 ${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return phone;
}
