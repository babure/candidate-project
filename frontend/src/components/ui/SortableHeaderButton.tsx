type SortDir = 'asc' | 'desc';

type SortableHeaderButtonProps = {
  label: string;
  active: boolean;
  direction?: SortDir;
  onClick: () => void;
};

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9.5V2.5" strokeLinecap="round" />
      <path d="M3 5.5L6 2.5L9 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 2.5V9.5" strokeLinecap="round" />
      <path d="M3 6.5L6 9.5L9 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Side-by-side up/down arrows; only the active direction is emphasized. */
export function SortDirectionArrows({
  active,
  direction = 'asc',
}: {
  active: boolean;
  direction?: SortDir;
}) {
  const upActive = active && direction === 'asc';
  const downActive = active && direction === 'desc';

  return (
    <span className="inline-flex items-center gap-px" aria-hidden="true">
      <ArrowUp
        className={['size-2 shrink-0', upActive ? 'text-foreground opacity-100' : 'text-default-400 opacity-35'].join(
          ' '
        )}
      />
      <ArrowDown
        className={[
          'size-2 shrink-0',
          downActive ? 'text-foreground opacity-100' : 'text-default-400 opacity-35',
        ].join(' ')}
      />
    </span>
  );
}

export function SortableHeaderButton({
  label,
  active,
  direction = 'asc',
  onClick,
}: SortableHeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="inline-flex cursor-pointer items-center gap-1 uppercase outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Sort by ${label}${active ? `, currently ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
    >
      <span className={active ? 'font-semibold text-foreground' : 'font-medium text-muted'}>
        {label}
      </span>
      <SortDirectionArrows active={active} direction={direction} />
    </button>
  );
}

/** Toggle sort field: first click uses preferredDefault, second click flips. */
export function nextSortState<T extends string>(
  currentField: T | null,
  currentDir: SortDir,
  field: T,
  preferredDefault: SortDir = 'asc'
): { field: T; direction: SortDir } {
  if (currentField !== field) {
    return { field, direction: preferredDefault };
  }
  return { field, direction: currentDir === 'asc' ? 'desc' : 'asc' };
}

export type { SortDir };
