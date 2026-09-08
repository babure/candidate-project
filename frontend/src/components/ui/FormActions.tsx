import type { ReactNode } from 'react';

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

/** Right-aligned form actions: secondary (if any) then primary. Stacks on small screens. */
export default function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div
      className={[
        'flex w-full flex-col-reverse gap-2',
        'sm:flex-row sm:flex-wrap sm:items-center sm:justify-end',
        '[&>button]:w-full sm:[&>button]:w-auto',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
