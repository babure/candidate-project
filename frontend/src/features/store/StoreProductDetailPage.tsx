import { useEffect, useState } from 'react';
import { Button, Card, TextField, Input, Label, Chip } from '@heroui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

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
    setPlacing(true);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: product.id,
        quantity: Number(quantity),
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

  if (!product) return null;

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onPress={() => navigate('/oms/catalog')} className="mb-4">
        ← Back to catalog
      </Button>

      <Card className="mb-6">
        <Card.Header className="flex justify-between items-center">
          <Card.Title>Product Detail</Card.Title>
          <Chip size="sm" color={product.inStock ? 'success' : 'danger'}>
            <Chip.Label>{product.inStock ? 'In stock' : 'Out of stock'}</Chip.Label>
          </Chip>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-default-500">Name</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Category</p>
            <p>{product.category || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Description</p>
            <p>{product.description || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Price</p>
            <p className="font-medium">${product.price?.toFixed(2)}</p>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Place Order</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <TextField>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e: any) => setQuantity(e.target.value)}
              isDisabled={!product.inStock}
            />
          </TextField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            variant="primary"
            onPress={handlePlaceOrder}
            isDisabled={!product.inStock || placing}
          >
            {placing ? 'Placing…' : 'Place Order'}
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
