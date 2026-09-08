import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useUser } from '../context/UserContext';

export default function ImsLayout() {
  const { currentUser, users, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppLayout
      currentUser={currentUser}
      users={users}
      onUserChange={setCurrentUser}
      system="ims"
      active="products"
      onNavigate={(key: string) => {
        if (key === 'products') navigate('/ims/products');
      }}
    >
      <Outlet key={location.pathname} />
    </AppLayout>
  );
}
