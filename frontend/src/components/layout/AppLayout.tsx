import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function AppLayout({
  children,
  currentUser,
  users,
  onUserChange,
  system = 'ims',
  active = 'products',
  onNavigate,
  onSwitchSystem,
}: any) {
  return (
    <div className="flex flex-col h-screen">
      <TopBar
        currentUser={currentUser}
        users={users}
        onUserChange={onUserChange}
        onSwitchSystem={onSwitchSystem}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} system={system} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto bg-default-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
