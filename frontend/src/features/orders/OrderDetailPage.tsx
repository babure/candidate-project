import { useEffect, useState } from 'react';
import { Chip } from '@heroui/react';
import { useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order) {
    return (
      <p className="text-sm text-default-500" role="status" aria-live="polite">
        Loading order…
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <BackLink to="/oms/orders" label="Back to orders" />

      <Panel
        title="Order Detail"
        actions={
          <Chip size="sm" color={order.status === 'CREATED' ? 'success' : 'default'}>
            <Chip.Label>{order.status}</Chip.Label>
          </Chip>
        }
      >
        <dl className="grid gap-4">
          <DetailField label="Order ID" tabular>
            {order.id}
          </DetailField>
          <DetailField label="Product Name">{order.productName}</DetailField>
          <DetailField label="Quantity" tabular>
            {order.quantity}
          </DetailField>
          <DetailField label="Unit Price" tabular>
            ${order.unitPrice?.toFixed(2)}
          </DetailField>
          <DetailField label="Total Amount" tabular>
            ${order.totalAmount?.toFixed(2)}
          </DetailField>
          <DetailField label="Date Placed">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
          </DetailField>
        </dl>
      </Panel>
    </div>
  );
}
