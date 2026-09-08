import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
};

export default function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {icon ? (
            <span className="inline-flex shrink-0 text-default-600 [&_svg]:size-5 sm:[&_svg]:size-6" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span>{title}</span>
        </h1>
        {description ? (
          <p className={`mt-1 text-pretty text-sm text-default-500 ${icon ? 'sm:pl-[2.125rem]' : ''}`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
