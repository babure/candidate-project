import { Button, Card } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

export default function SystemSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-default-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-center mb-2">MarketNode</h1>
        <p className="text-center text-default-500 mb-8">Select a system to continue</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <Card.Header>
              <Card.Title>IMS</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className="text-sm text-default-500">
                Inventory Management System for staff product and stock management.
              </p>
              <Button variant="primary" onPress={() => navigate('/ims/products')}>
                Enter IMS
              </Button>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>OMS</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className="text-sm text-default-500">
                Order Management System storefront for browsing products and placing orders.
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
