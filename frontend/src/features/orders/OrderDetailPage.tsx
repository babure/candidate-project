import { useEffect, useState } from 'react';
import { AlertDialog, Button, Chip } from '@heroui/react';
import { useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';
import FormActions from '../../components/ui/FormActions';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = () => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data));
  };

  useEffect(() => {
    setOrder(null);
    loadOrder();
  }, [id]);

  const handleCancel = () => {
    setError('');
    setCancelling(true);
    fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          let message = 'Failed to cancel order';
          try {
            message = JSON.parse(text).message || message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setConfirmOpen(false);
        setCancelling(false);
      })
      .catch((e) => {
        setCancelling(false);
        setError(e.message || 'Failed to cancel order');
      });
  };

  if (!order) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className="max-w-2xl">
      <BackLink to="/oms/orders" label="Back to orders" />

      <Panel
        title="Order Detail"
        actions={
          <div className="flex items-center gap-2">
            <Chip size="sm" color={order.status === 'CREATED' ? 'success' : 'default'}>
              <Chip.Label>{order.status}</Chip.Label>
            </Chip>
            {order.status === 'CREATED' ? (
              <Button size="sm" variant="danger" onPress={() => setConfirmOpen(true)}>
                Cancel order
              </Button>
            ) : null}
          </div>
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
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </Panel>

      <AlertDialog>
        <AlertDialog.Backdrop
          isOpen={confirmOpen}
          onOpenChange={(open: boolean) => {
            if (!cancelling) setConfirmOpen(open);
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Cancel this order?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-pretty text-sm text-default-600">
                  This will set the order status to CANCELLED and restore deducted stock when the
                  product still exists.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <FormActions>
                  <Button
                    variant="outline"
                    onPress={() => setConfirmOpen(false)}
                    isDisabled={cancelling}
                  >
                    Keep order
                  </Button>
                  <Button variant="danger" onPress={handleCancel} isDisabled={cancelling}>
                    {cancelling ? 'Cancelling…' : 'Cancel order'}
                  </Button>
                </FormActions>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
