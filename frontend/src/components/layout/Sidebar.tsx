import { useNavigate } from 'react-router-dom';
import { NavIcons, type NavIconId } from '../ui/NavIcons';
import { useMdUp } from '../../hooks/useMdUp';

type NavItem = {
  id: Exclude<NavIconId, 'exit'>;
  label: string;
  disabled?: boolean;
};

const imsItems: NavItem[] = [
  { id: 'products', label: 'Products' },
  { id: 'suppliers', label: 'Suppliers', disabled: true },
  { id: 'warehouses', label: 'Warehouses', disabled: true },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'reports', label: 'Reports', disabled: true },
];

const omsItems: NavItem[] = [
  { id: 'catalog', label: 'Catalog' },
  { id: 'orders', label: 'Orders' },
];

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      {collapsed ? (
        <>
          <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
          <path d="m14 9 3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          <path d="m10 9-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

type SidebarProps = {
  active?: string;
  system?: 'ims' | 'oms';
  navOpen?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: (id: string) => void;
  onExitSystem?: () => void;
};

export default function Sidebar({
  active,
  system = 'ims',
  navOpen = false,
  collapsed = false,
  onCollapsedChange,
  onNavigate,
  onExitSystem,
}: SidebarProps) {
  const navigate = useNavigate();
  const mdUp = useMdUp();
  const items = system === 'oms' ? omsItems : imsItems;
  const navLabel = system === 'oms' ? 'Order Management menu' : 'Inventory Management menu';
  const ExitIcon = NavIcons.exit;
  const interactive = mdUp || navOpen;
  const railCollapsed = mdUp && collapsed && system === 'oms';

  const handleExit = () => {
    if (onExitSystem) onExitSystem();
    else navigate('/');
  };

  return (
    <aside
      id="app-sidebar"
      className={[
        'flex flex-col border-r border-default-200 bg-white',
        'fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] shadow-lg transition-[transform,width] duration-200 ease-out',
        railCollapsed
          ? 'md:static md:z-auto md:w-[4.25rem] md:shrink-0 md:translate-x-0 md:shadow-none'
          : 'md:static md:z-auto md:w-56 md:shrink-0 md:translate-x-0 md:shadow-none md:transition-none',
        navOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none md:pointer-events-auto',
      ].join(' ')}
      aria-label={navLabel}
      aria-hidden={interactive ? undefined : true}
    >
      <div className="flex min-h-0 flex-1 flex-col p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pt-3 md:pb-3">
        <nav aria-label={navLabel} className="min-h-0 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const selected = active === item.id;
              const Icon = NavIcons[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={item.disabled}
                    aria-current={selected ? 'page' : undefined}
                    title={railCollapsed ? item.label : undefined}
                    tabIndex={interactive ? undefined : -1}
                    onClick={() => {
                      if (!item.disabled && onNavigate) onNavigate(item.id);
                    }}
                    className={[
                      'flex min-h-11 w-full items-center rounded-lg border text-sm outline-none transition-colors md:min-h-0 md:py-2',
                      railCollapsed ? 'justify-center gap-0 px-2 py-2.5' : 'gap-3 px-2.5 py-2.5',
                      'focus-visible:ring-1 focus-visible:ring-accent',
                      item.disabled
                        ? 'cursor-not-allowed border-transparent text-default-300 opacity-60'
                        : selected
                          ? 'cursor-pointer border-default-200 bg-default-100 font-semibold text-foreground shadow-sm'
                          : 'cursor-pointer border-transparent text-default-600 hover:border-default-200 hover:bg-default-50 hover:text-foreground',
                    ].join(' ')}
                  >
                    <span
                      className={
                        selected
                          ? 'text-foreground'
                          : item.disabled
                            ? 'text-default-300'
                            : 'text-default-500'
                      }
                    >
                      <Icon />
                    </span>
                    {railCollapsed ? (
                      <span className="sr-only">{item.label}</span>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-3 space-y-1 border-t border-default-200 pt-3">
          {system === 'oms' && mdUp && onCollapsedChange ? (
            <button
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              aria-pressed={collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={[
                'flex min-h-0 w-full cursor-pointer items-center rounded-lg border border-transparent py-2 text-sm text-default-600 outline-none transition-colors',
                'hover:border-default-200 hover:bg-default-50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent',
                railCollapsed ? 'justify-center px-2' : 'gap-3 px-2.5',
              ].join(' ')}
            >
              <span className="text-default-500">
                <CollapseIcon collapsed={collapsed} />
              </span>
              {railCollapsed ? null : <span>Collapse</span>}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleExit}
            tabIndex={interactive ? undefined : -1}
            title={railCollapsed ? 'Exit system' : undefined}
            className={[
              'flex min-h-11 w-full cursor-pointer items-center rounded-lg border border-transparent text-sm text-default-600 outline-none transition-colors',
              'hover:border-default-200 hover:bg-default-50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent md:min-h-0 md:py-2',
              railCollapsed ? 'justify-center gap-0 px-2 py-2.5' : 'gap-3 px-2.5 py-2.5',
            ].join(' ')}
          >
            <span className="text-default-500">
              <ExitIcon />
            </span>
            {railCollapsed ? <span className="sr-only">Exit system</span> : <span>Exit system</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
