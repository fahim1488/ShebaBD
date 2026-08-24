/**
 * dateHelpers.ts - Standalone date formatting and relative time helpers.
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function isDateInFuture(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() > Date.now();
}
