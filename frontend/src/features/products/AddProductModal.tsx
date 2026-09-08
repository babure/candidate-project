import { useState } from 'react';
import { Modal, Button, TextField, Input, Label } from '@heroui/react';

export default function AddProductModal({ isOpen, onClose, onCreated }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setError('');
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setError('Enter a valid price of 0 or greater.');
      return;
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description,
        category,
        price: Number(price),
        stock: 0,
      }),
    }).then(() => {
      reset();
      onCreated();
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
                    onChange={(e: any) => setName(e.target.value)}
                    autoFocus
                  />
                </TextField>
                <TextField>
                  <Label>Category</Label>
                  <Input
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                  />
                </TextField>
                <TextField>
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                  />
                </TextField>
                <TextField isRequired>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min={0}
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
              <Button variant="primary" onPress={handleSubmit}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
