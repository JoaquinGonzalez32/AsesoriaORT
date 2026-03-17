import React from 'react';

/** Pulsing placeholder block */
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

/** Skeleton for a stat card */
export const SkeletonCard: React.FC = () => (
  <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
    <SkeletonBlock className="h-3 w-24" />
    <SkeletonBlock className="h-10 w-20" />
    <SkeletonBlock className="h-2 w-32" />
  </div>
);

/** Skeleton for a table row */
export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonBlock className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
      </td>
    ))}
  </tr>
);

/** Full table skeleton */
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 8, cols = 6 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 flex gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-9 w-32 rounded-xl" />
      ))}
    </div>
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

/** Skeleton for card-based layouts (RAS, Listas) */
export const SkeletonCardList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
        <SkeletonBlock className="h-8 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

/** Dashboard skeleton */
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <SkeletonBlock className="h-64 w-full rounded-2xl" />
  </div>
);
