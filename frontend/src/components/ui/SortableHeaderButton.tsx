type SortDir = 'asc' | 'desc';

type SortableHeaderButtonProps = {
  label: string;
  active: boolean;
  direction?: SortDir;
  onClick: () => void;
};

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
      className={[
        'inline-flex cursor-pointer items-center gap-1 uppercase outline-none focus-visible:ring-2 focus-visible:ring-accent',
        active ? 'font-semibold text-foreground' : 'font-medium text-muted',
      ].join(' ')}
      aria-label={`Sort by ${label}${active ? `, currently ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
    >
      <span>{label}</span>
      <span className="-space-y-1 inline-flex flex-col text-[9px] leading-none" aria-hidden="true">
        <span className={active && direction === 'asc' ? 'text-foreground' : 'text-default-300'}>▲</span>
        <span className={active && direction === 'desc' ? 'text-foreground' : 'text-default-300'}>▼</span>
      </span>
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
