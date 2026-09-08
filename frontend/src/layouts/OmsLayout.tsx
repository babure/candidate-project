import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useUser } from '../context/UserContext';

export default function OmsLayout() {
  const { currentUser, users, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname.startsWith('/oms/orders') ? 'orders' : 'catalog';

  return (
    <AppLayout
      currentUser={currentUser}
      users={users}
      onUserChange={setCurrentUser}
      system="oms"
      active={active}
      onNavigate={(key: string) => {
        if (key === 'catalog') navigate('/oms/catalog');
        if (key === 'orders') navigate('/oms/orders');
      }}
      onSwitchSystem={() => navigate('/')}
    >
      <Outlet key={location.pathname} />
    </AppLayout>
  );
}
