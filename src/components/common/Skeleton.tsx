/**
 * Skeleton.tsx — Reusable loading skeleton components for better UX.
 *
 * Usage:
 *   <Skeleton />                    — single line
 *   <Skeleton width="w-1/2" />      — half-width line
 *   <SkeletonCard />                — full card skeleton
 *   <SkeletonDonorCard />           — blood donor card skeleton
 *   <SkeletonStatCard />            — stat card skeleton
 *   <SkeletonList count={5} />      — list of skeleton rows
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}

/** Single animated skeleton bar */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'rounded',
}: SkeletonProps) {
  return (
    <div
      className={`${width} ${height} ${rounded} bg-ds-muted/20 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

/** A generic card-shaped skeleton */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-ds-xl border border-ds-border bg-ds-card p-5 space-y-3 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-2/3" height="h-4" />
          <Skeleton width="w-1/3" height="h-3" />
        </div>
      </div>
      <Skeleton width="w-full" height="h-3" />
      <Skeleton width="w-5/6" height="h-3" />
      <Skeleton width="w-4/6" height="h-3" />
    </div>
  );
}

/** Blood donor card skeleton */
export function SkeletonDonorCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-ds-xl border border-ds-border bg-ds-card p-5 space-y-4 ${className}`}
      aria-hidden="true"
    >
      {/* Header row: blood group badge + name */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
          <div className="space-y-2">
            <Skeleton width="w-32" height="h-4" />
            <Skeleton width="w-20" height="h-3" />
          </div>
        </div>
        <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
      </div>

      {/* Info rows */}
      <div className="space-y-2">
        <Skeleton width="w-3/4" height="h-3" />
        <Skeleton width="w-1/2" height="h-3" />
      </div>

      {/* Action button */}
      <Skeleton width="w-full" height="h-9" rounded="rounded-ds-lg" />
    </div>
  );
}

/** Stat card skeleton */
export function SkeletonStatCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-ds-xl border border-ds-border bg-ds-card p-5 space-y-3 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton width="w-10" height="h-10" rounded="rounded-ds-lg" />
        <Skeleton width="w-16" height="h-5" rounded="rounded-full" />
      </div>
      <Skeleton width="w-1/2" height="h-7" />
      <Skeleton width="w-2/3" height="h-3" />
    </div>
  );
}

/** Table/list row skeleton */
export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-4 py-3 border-b border-ds-border last:border-0 ${className}`}
      aria-hidden="true"
    >
      <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-3/4" height="h-3" />
        <Skeleton width="w-1/2" height="h-3" />
      </div>
      <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
    </div>
  );
}

/** Renders N skeleton rows */
export function SkeletonList({
  count = 4,
  type = 'card',
  className = '',
}: {
  count?: number;
  type?: 'card' | 'donor' | 'stat' | 'row';
  className?: string;
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => {
        switch (type) {
          case 'donor': return <SkeletonDonorCard key={i} className={className} />;
          case 'stat':  return <SkeletonStatCard key={i} className={className} />;
          case 'row':   return <SkeletonRow key={i} className={className} />;
          default:      return <SkeletonCard key={i} className={className} />;
        }
      })}
    </>
  );
}

export default Skeleton;
