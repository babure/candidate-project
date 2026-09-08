import { useEffect, useState } from 'react';
import { AlertDialog, Button, Chip } from '@heroui/react';
import { useLocation, useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import EmptyState from '../../components/ui/EmptyState';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';
import FormActions from '../../components/ui/FormActions';
import { fetchJson, readErrorMessage } from '../../lib/fetchJson';
import { formatMoney, type Order } from '../../types/api';

type OrderDetailLocationState = {
  from?: 'catalog' | 'orders';
  listSearch?: string;
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navState = (location.state as OrderDetailLocationState | null) ?? null;
  const fromCatalog = navState?.from === 'catalog';
  const backTo = fromCatalog
    ? `/oms/catalog${navState?.listSearch ? `?${navState.listSearch}` : ''}`
    : `/oms/orders${navState?.listSearch ? `?${navState.listSearch}` : ''}`;
  const backLabel = fromCatalog ? 'Back to catalog' : 'Back to orders';

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');
    setOrder(null);

    fetchJson<Order>(`/api/orders/${id}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setOrder(data);
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setLoadError(e.message || 'Failed to load order');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const handleCancel = () => {
    setError('');
    setCancelling(true);
    fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) throw new Error(await readErrorMessage(r, 'Failed to cancel order'));
        return r.json() as Promise<Order>;
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

  if (isLoading && !order) {
    return <DetailPanelSkeleton />;
  }

  if (loadError && !order) {
    return (
      <div className="w-full max-w-2xl">
        <BackLink to={backTo} label={backLabel} />
        <EmptyState
          title="Couldn't load order"
          description={loadError}
          action={
            <Button variant="primary" onPress={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!order) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className="w-full max-w-2xl">
      <BackLink to={backTo} label={backLabel} />

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
            ${formatMoney(order.unitPrice)}
          </DetailField>
          <DetailField label="Total Amount" tabular>
            ${formatMoney(order.totalAmount)}
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
                  This order will be cancelled and cannot be undone.
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
