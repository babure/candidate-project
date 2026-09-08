import { useEffect, useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order) return null;

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onPress={() => navigate('/oms/orders')} className="mb-4">
        ← Back to orders
      </Button>

      <Card>
        <Card.Header className="flex justify-between items-center">
          <Card.Title>Order Detail</Card.Title>
          <Chip size="sm" color={order.status === 'CREATED' ? 'success' : 'default'}>
            <Chip.Label>{order.status}</Chip.Label>
          </Chip>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-default-500">Order ID</p>
            <p className="font-medium">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Product Name</p>
            <p className="font-medium">{order.productName}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Quantity</p>
            <p>{order.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Unit Price</p>
            <p>${order.unitPrice?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Total Amount</p>
            <p className="font-medium">${order.totalAmount?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Date Placed</p>
            <p>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
