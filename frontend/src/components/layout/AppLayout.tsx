import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useMdUp } from '../../hooks/useMdUp';

export default function AppLayout({
  children,
  currentUser,
  users,
  onUserChange,
  system = 'ims',
  active = 'products',
  onNavigate,
}: any) {
  const navigate = useNavigate();
  const mdUp = useMdUp();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (mdUp) setNavOpen(false);
  }, [mdUp]);

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen || mdUp) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen, mdUp]);

  const handleNavigate = (key: string) => {
    setNavOpen(false);
    if (onNavigate) onNavigate(key);
  };

  return (
    <div className="flex h-dvh flex-col bg-default-100">
      <TopBar
        currentUser={currentUser}
        users={users}
        onUserChange={onUserChange}
        system={system}
        navOpen={navOpen}
        onNavToggle={() => setNavOpen((o) => !o)}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 md:hidden"
            aria-label="Close navigation menu"
            onClick={() => setNavOpen(false)}
          />
        ) : null}
        <Sidebar
          active={active}
          system={system}
          navOpen={navOpen}
          onNavigate={handleNavigate}
          onExitSystem={() => {
            setNavOpen(false);
            navigate('/');
          }}
        />
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5 md:p-6"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
