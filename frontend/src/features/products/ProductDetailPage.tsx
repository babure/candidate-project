import { useEffect, useState } from 'react';
import { Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stockAmount, setStockAmount] = useState('');
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data));
  }, [id]);

  const handleEdit = () => {
    setEditData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, ...editData }),
    }).then(() => {
      window.location.reload();
    });
  };

  const handleStockAdjust = () => {
    setStockError('');
    if (!stockAmount.trim()) {
      setStockError('Enter an amount to adjust stock.');
      return;
    }
    fetch(`/api/products/${product.id}/stock?amount=${stockAmount}`, {
      method: 'PATCH',
    })
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setStockAmount('');
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
      <BackLink to="/ims/products" label="Back to products" />

      <Panel
        className="mb-4"
        title="Product Detail"
        actions={
          <div className="flex items-center gap-2">
            <Chip size="sm" color={product.stock > 0 ? 'success' : 'danger'}>
              <Chip.Label className="tabular-nums">Stock: {product.stock}</Chip.Label>
            </Chip>
            {!isEditing && (
              <Button size="sm" variant="outline" onPress={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        }
      >
        {isEditing ? (
          <>
            <TextField isRequired>
              <Label>Name</Label>
              <Input
                value={editData.name}
                onChange={(e: any) => setEditData({ ...editData, name: e.target.value })}
              />
            </TextField>
            <TextField>
              <Label>Category</Label>
              <Input
                value={editData.category}
                onChange={(e: any) => setEditData({ ...editData, category: e.target.value })}
              />
            </TextField>
            <TextField>
              <Label>Description</Label>
              <Input
                value={editData.description}
                onChange={(e: any) => setEditData({ ...editData, description: e.target.value })}
              />
            </TextField>
            <TextField isRequired>
              <Label>Price</Label>
              <Input
                type="number"
                value={String(editData.price)}
                onChange={(e: any) => setEditData({ ...editData, price: Number(e.target.value) })}
              />
            </TextField>
            <div className="flex gap-2">
              <Button variant="primary" onPress={handleUpdate}>
                Save Changes
              </Button>
              <Button variant="outline" onPress={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <dl className="grid gap-4">
            <DetailField label="Name">{product.name}</DetailField>
            <DetailField label="Category">{product.category || '—'}</DetailField>
            <DetailField label="Description">{product.description || '—'}</DetailField>
            <DetailField label="Price" tabular>
              ${product.price?.toFixed(2)}
            </DetailField>
          </dl>
        )}
      </Panel>

      <Panel title="Adjust Stock">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField className="min-w-[12rem] flex-1">
            <Label>Amount</Label>
            <Input
              placeholder="e.g. 5 or -3"
              value={stockAmount}
              onChange={(e: any) => setStockAmount(e.target.value)}
              inputMode="numeric"
            />
          </TextField>
          <Button variant="primary" onPress={handleStockAdjust}>
            Adjust
          </Button>
        </div>
        {stockError ? (
          <p className="text-sm text-danger" role="alert">
            {stockError}
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
