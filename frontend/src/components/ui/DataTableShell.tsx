import type { ReactNode } from 'react';

type DataTableShellProps = {
  children: ReactNode;
  label: string;
};

export default function DataTableShell({ children, label }: DataTableShellProps) {
  return (
    <div
      className="data-table-shell overflow-hidden rounded-lg border border-default-200 bg-white"
      aria-label={label}
    >
      {children}
    </div>
  );
}
