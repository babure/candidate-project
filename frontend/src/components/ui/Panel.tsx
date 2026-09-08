import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, actions, children, className = '' }: PanelProps) {
  const titleId = `panel-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section
      className={`rounded-lg border border-default-200 bg-white ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-2 border-b border-default-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-3.5">
        <h2 id={titleId} className="text-balance text-base font-semibold text-foreground">
          {title}
        </h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
}
