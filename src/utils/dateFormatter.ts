/**
 * Date / time formatting utilities used across the ShebaBD UI.
 */

/** "August 18, 2026" */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** "Aug 18, 2026" */
export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** "just now", "5 min ago", "3 hours ago", "2 days ago" */
export function formatRelativeTime(date: string | Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours   = Math.floor(diffMs / 3_600_000);
  const days    = Math.floor(diffMs / 86_400_000);

  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours   < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days    < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatShortDate(date);
}

/** "02:45 PM" */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

/** "Aug 18 · 02:45 PM" */
export function formatDateTime(date: string | Date): string {
  return `${formatShortDate(date)} · ${formatTime(date)}`;
}
