import { ListBox } from '@heroui/react';

const imsItems = [
  { id: 'products', label: 'Products', disabled: false },
  { id: 'suppliers', label: 'Suppliers', disabled: true },
  { id: 'warehouses', label: 'Warehouses', disabled: true },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'reports', label: 'Reports', disabled: true },
];

const omsItems = [
  { id: 'catalog', label: 'Catalog', disabled: false },
  { id: 'orders', label: 'Orders', disabled: false },
];

export default function Sidebar({ active, system = 'ims', onNavigate }: any) {
  const items = system === 'oms' ? omsItems : imsItems;
  const title = system === 'oms' ? 'Order Management' : 'Inventory Management';

  const handleSelectionChange = (keys: any) => {
    const key = keys === 'all' ? null : Array.from(keys as Set<any>)[0];
    if (key != null && onNavigate) {
      onNavigate(String(key));
    }
  };

  return (
    <aside className="w-56 border-r border-default-200 bg-default-50 min-h-0 shrink-0">
      <div className="p-3">
        <p className="text-xs font-semibold text-default-400 uppercase tracking-wider px-2 mb-2">
          {title}
        </p>
        <ListBox
          aria-label="Navigation"
          selectionMode="single"
          selectedKeys={new Set([active])}
          disabledKeys={new Set(items.filter((i) => i.disabled).map((i) => i.id))}
          onSelectionChange={handleSelectionChange}
        >
          {items.map((item) => (
            <ListBox.Item key={item.id} id={item.id}>{item.label}</ListBox.Item>
          ))}
        </ListBox>
      </div>
    </aside>
  );
}
