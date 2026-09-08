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
      <div className="flex items-center justify-between gap-3 border-b border-default-200 px-5 py-3.5">
        <h2 id={titleId} className="text-balance text-base font-semibold text-foreground">
          {title}
        </h2>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="flex flex-col gap-4 px-5 py-5">{children}</div>
    </section>
  );
}
