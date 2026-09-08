import { useEffect, useState } from 'react';
import { Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_RULES,
  roundMoney,
  validateProductInput,
  validateStockAdjust,
} from '../../lib/validation';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stockAmount, setStockAmount] = useState('');
  const [stockError, setStockError] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    setProduct(null);
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
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditData(null);
    setEditError('');
    setIsEditing(false);
  };

  const handleUpdate = () => {
    const validationError = validateProductInput({
      name: editData.name,
      category: editData.category,
      description: editData.description,
      price: editData.price,
    });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError('');
    setSaving(true);
    fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: String(editData.name).trim(),
        description: editData.description,
        category: editData.category,
        price: roundMoney(Number(editData.price)),
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          let message = 'Failed to update product';
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
        setProduct(data);
        setIsEditing(false);
        setEditData(null);
        setSaving(false);
      })
      .catch((e) => {
        setSaving(false);
        setEditError(e.message || 'Failed to update product');
      });
  };

  const handleStockAdjust = () => {
    const validationError = validateStockAdjust(product.stock ?? 0, stockAmount);
    if (validationError) {
      setStockError(validationError);
      return;
    }

    setStockError('');
    setAdjusting(true);
    fetch(`/api/products/${product.id}/stock?amount=${Number(stockAmount)}`, {
      method: 'PATCH',
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          let message = 'Failed to adjust stock';
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
        setProduct(data);
        setStockAmount('');
        setAdjusting(false);
      })
      .catch((e) => {
        setAdjusting(false);
        setStockError(e.message || 'Failed to adjust stock');
      });
  };

  if (!product) {
    return <DetailPanelSkeleton />;
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
                maxLength={PRODUCT_RULES.nameMax}
                onChange={(e: any) => setEditData({ ...editData, name: e.target.value })}
              />
            </TextField>
            <div>
              <label htmlFor="edit-product-category" className="mb-1 block text-sm font-medium">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="edit-product-category"
                required
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="w-full rounded-lg border border-default-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="">Select a category</option>
                {!(PRODUCT_CATEGORIES as readonly string[]).includes(editData.category) && editData.category ? (
                  <option value={editData.category}>
                    {editData.category} (invalid — choose a valid category)
                  </option>
                ) : null}
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <TextField>
              <Label>Description</Label>
              <Input
                value={editData.description}
                maxLength={PRODUCT_RULES.descriptionMax}
                onChange={(e: any) => setEditData({ ...editData, description: e.target.value })}
              />
            </TextField>
            <TextField isRequired>
              <Label>Price</Label>
              <Input
                type="number"
                min={PRODUCT_RULES.priceMin}
                max={PRODUCT_RULES.priceMax}
                step="0.01"
                value={String(editData.price)}
                onChange={(e: any) => setEditData({ ...editData, price: e.target.value })}
              />
            </TextField>
            {editError ? (
              <p className="text-sm text-danger" role="alert">
                {editError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button variant="primary" onPress={handleUpdate} isDisabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="outline" onPress={handleCancelEdit} isDisabled={saving}>
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
          <Button variant="primary" onPress={handleStockAdjust} isDisabled={adjusting}>
            {adjusting ? 'Adjusting…' : 'Adjust'}
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
