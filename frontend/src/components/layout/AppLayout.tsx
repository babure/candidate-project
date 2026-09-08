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
}: any) {
  return (
    <div className="flex h-dvh flex-col bg-default-100">
      <TopBar
        currentUser={currentUser}
        users={users}
        onUserChange={onUserChange}
        system={system}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar active={active} system={system} onNavigate={onNavigate} />
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto p-6"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
