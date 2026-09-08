import type { ReactNode } from 'react';

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  tabular?: boolean;
};

export default function DetailField({ label, children, tabular = false }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-default-500">{label}</dt>
      <dd className={`mt-0.5 text-pretty text-foreground ${tabular ? 'tabular-nums' : ''} ${typeof children === 'string' || typeof children === 'number' ? 'font-medium' : ''}`}>
        {children}
      </dd>
    </div>
  );
}
