import { useNavigate } from 'react-router-dom';
import { NavIcons, type NavIconId } from '../ui/NavIcons';

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

export default function Sidebar({ active, system = 'ims', onNavigate, onExitSystem }: any) {
  const navigate = useNavigate();
  const items = system === 'oms' ? omsItems : imsItems;
  const navLabel = system === 'oms' ? 'Order Management menu' : 'Inventory Management menu';
  const ExitIcon = NavIcons.exit;

  const handleExit = () => {
    if (onExitSystem) onExitSystem();
    else navigate('/');
  };

  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-default-200 bg-white"
      aria-label={navLabel}
    >
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <nav aria-label={navLabel} className="min-h-0 flex-1">
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
                    onClick={() => {
                      if (!item.disabled && onNavigate) onNavigate(item.id);
                    }}
                    className={[
                      'flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-sm outline-none transition-colors',
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
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-3 border-t border-default-200 pt-3">
          <button
            type="button"
            onClick={handleExit}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-sm text-default-600 outline-none transition-colors hover:border-default-200 hover:bg-default-50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className="text-default-500">
              <ExitIcon />
            </span>
            <span>Exit system</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
