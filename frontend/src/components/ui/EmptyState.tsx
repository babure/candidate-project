import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-default-200 bg-white px-4 py-8 sm:px-6 sm:py-10"
      role="status"
    >
      <h2 className="text-balance text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-pretty text-sm text-default-500">{description}</p>
      {action}
    </div>
  );
}
