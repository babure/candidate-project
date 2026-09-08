import { useEffect, useMemo, useState } from 'react';
import { AlertDialog, Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import EmptyState from '../../components/ui/EmptyState';
import { PRODUCT_RULES, roundMoney, validateOrderQuantity } from '../../lib/validation';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';
import FormActions from '../../components/ui/FormActions';
import { fetchJson, readErrorMessage } from '../../lib/fetchJson';
import { formatMoney, type Order, type StoreProduct } from '../../types/api';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const catalogSearch = (location.state as { listSearch?: string } | null)?.listSearch;
  const backTo = `/oms/catalog${catalogSearch ? `?${catalogSearch}` : ''}`;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');
    setProduct(null);

    fetchJson<StoreProduct>(`/api/store/products/${id}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setProduct(data);
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setLoadError(e.message || 'Failed to load product');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const parsedQty = Number(quantity);
  const unitPrice = product?.price ?? 0;
  const qtyValid = Number.isFinite(parsedQty) && parsedQty >= 1;
  const lineTotal = useMemo(() => {
    if (!qtyValid) return null;
    return roundMoney(unitPrice * parsedQty);
  }, [parsedQty, unitPrice, qtyValid]);

  const openConfirm = () => {
    setError('');
    const quantityError = validateOrderQuantity(quantity);
    if (quantityError) {
      setError(quantityError);
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPlaceOrder = () => {
    if (!product) return;
    setError('');
    const quantityError = validateOrderQuantity(quantity);
    if (quantityError) {
      setError(quantityError);
      setConfirmOpen(false);
      return;
    }
    const qty = Number(quantity);
    setPlacing(true);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: product.id,
        quantity: qty,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await readErrorMessage(r, 'Failed to place order'));
        return r.json() as Promise<Order>;
      })
      .then((order) => {
        setPlacing(false);
        setConfirmOpen(false);
        navigate(`/oms/orders/${order.id}`, {
          state: {
            from: 'catalog',
            listSearch: catalogSearch,
          },
        });
      })
      .catch((e) => {
        setPlacing(false);
        setError(e.message || 'Failed to place order');
        setConfirmOpen(false);
      });
  };

  if (isLoading && !product) {
    return <DetailPanelSkeleton />;
  }

  if (loadError && !product) {
    return (
      <div className="w-full max-w-5xl">
        <BackLink to={backTo} label="Back to catalog" />
        <EmptyState
          title="Couldn't load product"
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

  if (!product) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className="w-full max-w-5xl">
      <BackLink to={backTo} label="Back to catalog" />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <Panel
          title="Product Detail"
          actions={
            <Chip size="sm" color={product.inStock ? 'success' : 'danger'}>
              <Chip.Label>{product.inStock ? 'In stock' : 'Out of stock'}</Chip.Label>
            </Chip>
          }
        >
          <dl className="grid gap-4">
            <DetailField label="Name">{product.name}</DetailField>
            <DetailField label="Category">{product.category || '—'}</DetailField>
            <DetailField label="Description">{product.description || '—'}</DetailField>
            <DetailField label="Price" tabular>
              ${formatMoney(product.price)}
            </DetailField>
          </dl>
        </Panel>

        <Panel title="Place Order" className="lg:sticky lg:top-4">
          <TextField>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={PRODUCT_RULES.quantityMin}
              max={PRODUCT_RULES.quantityMax}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              isDisabled={!product.inStock}
              aria-describedby={error ? 'order-error' : 'order-summary'}
            />
          </TextField>

          <dl
            id="order-summary"
            className="grid gap-2 rounded-lg border border-default-200 bg-default-50 px-3 py-3 text-sm"
          >
            <div className="flex justify-between gap-3">
              <dt className="text-default-500">Unit price</dt>
              <dd className="tabular-nums text-foreground">${formatMoney(unitPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-default-500">Quantity</dt>
              <dd className="tabular-nums text-foreground">{qtyValid ? parsedQty : '—'}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-default-200 pt-2">
              <dt className="font-medium text-foreground">Total</dt>
              <dd className="tabular-nums font-semibold text-foreground">
                {lineTotal != null ? `$${formatMoney(lineTotal)}` : '—'}
              </dd>
            </div>
          </dl>

          {error ? (
            <p id="order-error" className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <FormActions>
            <Button
              variant="primary"
              onPress={openConfirm}
              isDisabled={!product.inStock || placing}
            >
              Place Order
            </Button>
          </FormActions>
        </Panel>
      </div>

      <AlertDialog>
        <AlertDialog.Backdrop
          isOpen={confirmOpen}
          onOpenChange={(open: boolean) => {
            if (!placing) setConfirmOpen(open);
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>Confirm your order?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-pretty text-sm text-default-600">
                  Place this order for <span className="font-medium text-foreground">{product.name}</span>
                  {lineTotal != null ? (
                    <>
                      {' '}
                      totaling <span className="font-medium tabular-nums text-foreground">${formatMoney(lineTotal)}</span>
                    </>
                  ) : null}
                  ?
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <FormActions>
                  <Button
                    variant="outline"
                    onPress={() => setConfirmOpen(false)}
                    isDisabled={placing}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onPress={handleConfirmPlaceOrder} isDisabled={placing}>
                    {placing ? 'Placing…' : 'Confirm order'}
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
