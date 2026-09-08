import { Button, Card } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

export default function SystemSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-default-100 p-6">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-balance text-3xl font-semibold text-foreground">MarketNode</h1>
          <p className="mt-2 text-pretty text-default-500">
            Select a system to continue. No sign-in is required.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
          <Card role="listitem" className="border border-default-200 bg-white shadow-none">
            <Card.Header>
              <Card.Title className="text-balance">Inventory Management</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className="text-pretty text-sm text-default-500">
                Staff tools for managing the product catalog, pricing, and stock levels.
              </p>
              <Button variant="primary" onPress={() => navigate('/ims/products')}>
                Enter IMS
              </Button>
            </Card.Content>
          </Card>

          <Card role="listitem" className="border border-default-200 bg-white shadow-none">
            <Card.Header>
              <Card.Title className="text-balance">Order Management</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className="text-pretty text-sm text-default-500">
                Customer storefront for browsing products and placing orders.
              </p>
              <Button variant="primary" onPress={() => navigate('/oms/catalog')}>
                Enter OMS
              </Button>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
