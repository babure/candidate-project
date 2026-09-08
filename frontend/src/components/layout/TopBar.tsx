import { Avatar, Dropdown } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import marketnodeLogo from '../../assets/marketnode-logo.png';

function SwitchIcon() {
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
    >
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3 14 10" />
      <path d="m3 21 7-7" />
    </svg>
  );
}

export default function TopBar({
  currentUser,
  users,
  onUserChange,
  system = 'ims',
}: any) {
  const navigate = useNavigate();
  const systemFullName =
    system === 'oms' ? 'Order Management System' : 'Inventory Management System';
  const switchTargetLabel = system === 'oms' ? 'IMS' : 'OMS';

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-6"
      style={{ backgroundColor: '#080809' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="MarketNode home — select system"
        >
          <img
            src={marketnodeLogo}
            alt="MarketNode"
            className="h-7 w-auto"
          />
        </button>
        <span
          className="truncate text-sm font-medium text-[#f5f5f3]"
          aria-label={`Current system ${systemFullName}`}
        >
          {systemFullName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(system === 'oms' ? '/ims/products' : '/oms/catalog')}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[#f5f5f3]/80 outline-none transition-colors hover:bg-white/10 hover:text-[#f5f5f3] focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={`Switch to ${switchTargetLabel}`}
        >
          <SwitchIcon />
          Switch to {switchTargetLabel}
        </button>

        <Dropdown>
          <Dropdown.Trigger>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label={`Current user ${currentUser.name}. Open user menu`}
            >
              <span className="hidden text-sm text-[#f5f5f3]/70 sm:inline">
                {currentUser.email}
              </span>
              <Avatar size="sm">
                <Avatar.Fallback aria-hidden="true">{currentUser.name.charAt(0)}</Avatar.Fallback>
              </Avatar>
            </button>
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu
              aria-label="Switch user"
              onAction={(key: any) => {
                const user = users.find((u: any) => String(u.id) === String(key));
                if (user) onUserChange(user);
              }}
            >
              {users.map((u: any) => (
                <Dropdown.Item key={u.id} id={String(u.id)} textValue={u.name}>
                  {u.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
