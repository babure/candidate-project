import { useEffect, useState } from 'react';
import { Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import { PRODUCT_RULES, validateOrderQuantity } from '../../lib/validation';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetch(`/api/store/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data));
  }, [id]);

  const handlePlaceOrder = () => {
    setError('');
    const quantityError = validateOrderQuantity(quantity);
    if (quantityError) {
      setError(quantityError);
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
        navigate(`/oms/orders/${order.id}`);
      })
      .catch((e) => {
        setPlacing(false);
        setError(e.message || 'Failed to place order');
      });
  };

  if (!product) {
    return (
      <p className="text-sm text-default-500" role="status" aria-live="polite">
        Loading product…
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
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
        <Button
          variant="primary"
          onPress={handlePlaceOrder}
          isDisabled={!product.inStock || placing}
        >
          {placing ? 'Placing…' : 'Place Order'}
        </Button>
      </Panel>
    </div>
  );
}
