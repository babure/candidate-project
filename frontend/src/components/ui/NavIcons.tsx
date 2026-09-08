import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export const NavIcons = {
  products: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </IconBase>
  ),
  catalog: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </IconBase>
  ),
  orders: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </IconBase>
  ),
  suppliers: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  ),
  warehouses: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h6v6" />
    </IconBase>
  ),
  billing: (props?: IconProps) => (
    <IconBase {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </IconBase>
  ),
  reports: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 17V10" />
      <path d="M12 17V7" />
      <path d="M16 17v-4" />
    </IconBase>
  ),
  exit: (props?: IconProps) => (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  ),
} as const;

export type NavIconId = keyof typeof NavIcons;
