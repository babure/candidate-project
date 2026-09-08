import { Skeleton } from '@heroui/react';

export function TableListSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-default-200 bg-white"
      role="status"
      aria-label="Loading"
    >
      <div className="border-b border-default-200 bg-default-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20 rounded" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-default-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-default-200 bg-white p-4">
          <Skeleton className="mb-3 h-5 w-2/3 rounded" />
          <Skeleton className="mb-2 h-3 w-1/3 rounded" />
          <Skeleton className="mb-4 h-3 w-full rounded" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailPanelSkeleton() {
  return (
    <div className="max-w-2xl" role="status" aria-label="Loading">
      <Skeleton className="mb-4 h-8 w-40 rounded" />
      <div className="rounded-lg border border-default-200 bg-white">
        <div className="border-b border-default-200 px-5 py-3.5">
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-20 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
