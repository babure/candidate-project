import { useState } from 'react';
import { Modal, Button, TextField, Input, Label } from '@heroui/react';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_RULES,
  roundMoney,
  validateProductInput,
} from '../../lib/validation';

export default function AddProductModal({ isOpen, onClose, onCreated }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setError('');
    setSaving(false);
  };

  const handleSubmit = () => {
    const validationError = validateProductInput({ name, category, description, price });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSaving(true);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description,
        category,
        price: roundMoney(Number(price)),
        stock: 0,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          let message = 'Failed to create product';
          try {
            message = JSON.parse(text).message || message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }
      })
      .then(() => {
        reset();
        onCreated();
      })
      .catch((e) => {
        setSaving(false);
        setError(e.message || 'Failed to create product');
      });
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            reset();
            onClose();
          }
        }}
      >
        <Modal.Container size="lg">
          <Modal.Dialog aria-label="Add product">
            <Modal.CloseTrigger aria-label="Close add product dialog" />
            <Modal.Header>
              <Modal.Heading>Add Product</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <TextField isRequired>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    maxLength={PRODUCT_RULES.nameMax}
                    onChange={(e: any) => setName(e.target.value)}
                    autoFocus
                  />
                </TextField>
                <div>
                  <label htmlFor="add-product-category" className="mb-1 block text-sm font-medium">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    id="add-product-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-default-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <option value="">Select a category</option>
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
                    value={description}
                    maxLength={PRODUCT_RULES.descriptionMax}
                    onChange={(e: any) => setDescription(e.target.value)}
                  />
                </TextField>
                <TextField isRequired>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min={PRODUCT_RULES.priceMin}
                    max={PRODUCT_RULES.priceMax}
                    step="0.01"
                    value={price}
                    onChange={(e: any) => setPrice(e.target.value)}
                  />
                </TextField>
                {error ? (
                  <p className="text-sm text-danger" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline"
                onPress={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onPress={handleSubmit} isDisabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
