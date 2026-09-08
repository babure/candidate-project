import { useEffect, useMemo, useState } from 'react';
import { AlertDialog, Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import { PRODUCT_RULES, roundMoney, validateOrderQuantity } from '../../lib/validation';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';
import FormActions from '../../components/ui/FormActions';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const catalogSearch = (location.state as { listSearch?: string } | null)?.listSearch;

  useEffect(() => {
    setProduct(null);
    fetch(`/api/store/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data));
  }, [id]);

  const parsedQty = Number(quantity);
  const unitPrice = product?.price ?? 0;
  const lineTotal = useMemo(() => {
    if (!Number.isFinite(parsedQty) || parsedQty < 1) return null;
    return roundMoney(unitPrice * parsedQty);
  }, [parsedQty, unitPrice]);

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
        if (!r.ok) {
          const text = await r.text();
          let message = 'Failed to place order';
          try {
            const body = JSON.parse(text);
            message = body.message || message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }
        return r.json();
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

  if (!product) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className="w-full max-w-2xl">
      <BackLink to="/oms/catalog" label="Back to catalog" />

      <Panel
        className="mb-4"
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
            ${product.price?.toFixed(2)}
          </DetailField>
        </dl>
      </Panel>

      <Panel title="Place Order">
        <TextField>
          <Label>Quantity</Label>
          <Input
            type="number"
            min={PRODUCT_RULES.quantityMin}
            max={PRODUCT_RULES.quantityMax}
            step={1}
            value={quantity}
            onChange={(e: any) => setQuantity(e.target.value)}
            isDisabled={!product.inStock}
            aria-describedby={error ? 'order-error' : undefined}
          />
        </TextField>
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
                <AlertDialog.Heading>Confirm your order</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="mb-4 text-pretty text-sm text-default-600">
                  Please confirm the details below before placing your order.
                </p>
                <dl className="grid gap-3 rounded-lg border border-default-200 bg-default-50 px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-default-500">Product</dt>
                    <dd className="font-medium text-foreground">{product.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-default-500">Category</dt>
                    <dd className="text-foreground">{product.category || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-default-500">Quantity</dt>
                    <dd className="tabular-nums font-medium text-foreground">{parsedQty}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-default-500">Unit price</dt>
                    <dd className="tabular-nums text-foreground">${unitPrice.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-default-200 pt-3">
                    <dt className="font-medium text-foreground">Total</dt>
                    <dd className="tabular-nums font-semibold text-foreground">
                      {lineTotal != null ? `$${lineTotal.toFixed(2)}` : '—'}
                    </dd>
                  </div>
                </dl>
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
