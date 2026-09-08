import { useEffect, useState } from 'react';
import { AlertDialog, Button, TextField, Input, Label, Chip } from '@heroui/react';
import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../../components/ui/BackLink';
import Panel from '../../components/ui/Panel';
import DetailField from '../../components/ui/DetailField';
import EmptyState from '../../components/ui/EmptyState';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_RULES,
  roundMoney,
  validateProductInput,
  validateStockAdjust,
} from '../../lib/validation';
import { DetailPanelSkeleton } from '../../components/ui/LoadingSkeletons';
import FormActions from '../../components/ui/FormActions';
import { fetchJson, readErrorMessage } from '../../lib/fetchJson';
import { formatMoney, type Product } from '../../types/api';

type EditData = {
  name: string;
  description: string;
  category: string;
  price: number | string;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stockAmount, setStockAmount] = useState('');
  const [stockError, setStockError] = useState('');
  const [editError, setEditError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');
    setProduct(null);

    fetchJson<Product>(`/api/products/${id}`, { signal: controller.signal })
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

  const handleEdit = () => {
    if (!product) return;
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
    if (!product || !editData) return;
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
        if (!r.ok) throw new Error(await readErrorMessage(r, 'Failed to update product'));
        return r.json() as Promise<Product>;
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
    if (!product) return;
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
        if (!r.ok) throw new Error(await readErrorMessage(r, 'Failed to adjust stock'));
        return r.json() as Promise<Product>;
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

  const handleDelete = () => {
    if (!product) return;
    setDeleteError('');
    setDeleting(true);
    fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      .then(async (r) => {
        if (!r.ok) throw new Error(await readErrorMessage(r, 'Failed to delete product'));
      })
      .then(() => {
        setDeleting(false);
        setDeleteOpen(false);
        navigate('/ims/products');
      })
      .catch((e) => {
        setDeleting(false);
        setDeleteError(e.message || 'Failed to delete product');
      });
  };

  if (isLoading && !product) {
    return <DetailPanelSkeleton />;
  }

  if (loadError && !product) {
    return (
      <div className="w-full max-w-2xl">
        <BackLink to="/ims/products" label="Back to products" />
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
    <div className="w-full max-w-2xl">
      <BackLink to="/ims/products" label="Back to products" />

      <Panel
        className="mb-4"
        title="Product Detail"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" color={product.stock > 0 ? 'success' : 'danger'}>
              <Chip.Label className="tabular-nums">Stock: {product.stock}</Chip.Label>
            </Chip>
            {!isEditing && (
              <>
                <Button size="sm" variant="outline" onPress={handleEdit}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onPress={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      >
        {isEditing && editData ? (
          <>
            <TextField isRequired>
              <Label>Name</Label>
              <Input
                value={editData.name}
                maxLength={PRODUCT_RULES.nameMax}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
                className="form-control w-full rounded-lg border border-default-200 bg-white px-3 py-2 text-sm outline-none"
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
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              />
            </TextField>
            {editError ? (
              <p className="text-sm text-danger" role="alert">
                {editError}
              </p>
            ) : null}
            <FormActions>
              <Button variant="outline" onPress={handleCancelEdit} isDisabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleUpdate} isDisabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </FormActions>
          </>
        ) : (
          <dl className="grid gap-4">
            <DetailField label="Name">{product.name}</DetailField>
            <DetailField label="Category">{product.category || '—'}</DetailField>
            <DetailField label="Description">{product.description || '—'}</DetailField>
            <DetailField label="Price" tabular>
              ${formatMoney(product.price)}
            </DetailField>
          </dl>
        )}
      </Panel>

      <Panel title="Adjust Stock">
        <TextField>
          <Label>Amount</Label>
          <Input
            placeholder="e.g. 5 or -3"
            value={stockAmount}
            onChange={(e) => setStockAmount(e.target.value)}
            inputMode="numeric"
          />
        </TextField>
        {stockError ? (
          <p className="text-sm text-danger" role="alert">
            {stockError}
          </p>
        ) : null}
        <FormActions>
          <Button variant="primary" onPress={handleStockAdjust} isDisabled={adjusting}>
            {adjusting ? 'Adjusting…' : 'Adjust'}
          </Button>
        </FormActions>
      </Panel>

      <AlertDialog>
        <AlertDialog.Backdrop
          isOpen={deleteOpen}
          onOpenChange={(open: boolean) => {
            if (!deleting) {
              setDeleteOpen(open);
              if (!open) setDeleteError('');
            }
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete this product?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-pretty text-sm text-default-600">
                  “{product.name}” will be removed from the catalog. Orders that already reference it
                  keep their history. Products with open (CREATED) orders cannot be deleted.
                </p>
                {deleteError ? (
                  <p className="mt-3 text-sm text-danger" role="alert">
                    {deleteError}
                  </p>
                ) : null}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <FormActions>
                  <Button
                    variant="outline"
                    onPress={() => setDeleteOpen(false)}
                    isDisabled={deleting}
                  >
                    Keep product
                  </Button>
                  <Button variant="danger" onPress={handleDelete} isDisabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete product'}
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
