import { Button } from '@heroui/react';

type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export const DEFAULT_PAGE_SIZE = 20;

export function PaginationBar({ page, pageSize, total, onPageChange }: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(total, current * pageSize);

  return (
    <div className="mt-4 flex min-h-10 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-default-500" aria-live="polite">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="tabular-nums">{start}</span>–
            <span className="tabular-nums">{end}</span> of{' '}
            <span className="tabular-nums">{total}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          isDisabled={total === 0 || current <= 1}
          onPress={() => onPageChange(current - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span className="px-1 text-sm tabular-nums text-default-600">
          Page {total === 0 ? 0 : current} of {total === 0 ? 0 : totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          isDisabled={total === 0 || current >= totalPages}
          onPress={() => onPageChange(current + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/** Clamp page into [1, totalPages]. */
export function clampPage(page: number, total: number, pageSize: number): number {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
