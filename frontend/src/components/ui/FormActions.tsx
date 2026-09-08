import type { ReactNode } from 'react';

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

/** Right-aligned form actions: secondary (if any) then primary. */
export default function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`.trim()}>
      {children}
    </div>
  );
}
