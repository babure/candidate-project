import { Button, Card } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { useUser } from '../context/UserContext';

export default function SystemSelectPage() {
  const navigate = useNavigate();
  const { currentUser, users, setCurrentUser } = useUser();

  return (
    <div className="flex min-h-dvh flex-col bg-default-100">
      <TopBar
        currentUser={currentUser}
        users={users}
        onUserChange={setCurrentUser}
      />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-balance text-xl font-semibold text-foreground sm:text-2xl">
              Select a system
            </h1>
            <p className="mt-2 text-pretty text-sm text-default-500 sm:text-base">
              Choose Inventory Management System or Order Management System to continue. No
              sign-in is required.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
            <Card role="listitem" className="border border-default-200 bg-white shadow-none">
              <Card.Header>
                <Card.Title className="text-balance">Inventory Management System</Card.Title>
                <p className="mt-1 text-sm text-default-500">IMS</p>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <p className="text-pretty text-sm text-default-500">
                  Staff tools for managing the product catalog, pricing, and stock levels.
                </p>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onPress={() => navigate('/ims/products')}
                >
                  Enter IMS
                </Button>
              </Card.Content>
            </Card>

            <Card role="listitem" className="border border-default-200 bg-white shadow-none">
              <Card.Header>
                <Card.Title className="text-balance">Order Management System</Card.Title>
                <p className="mt-1 text-sm text-default-500">OMS</p>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <p className="text-pretty text-sm text-default-500">
                  Customer storefront for browsing products and placing orders.
                </p>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onPress={() => navigate('/oms/catalog')}
                >
                  Enter OMS
                </Button>
              </Card.Content>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
