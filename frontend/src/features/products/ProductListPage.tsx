import { useEffect, useState } from 'react';
import { Table, Button, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import AddProductModal from './AddProductModal';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';

export default function ProductListPage() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [isAddOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const loadProducts = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage catalog items, pricing, and stock."
        actions={
          <Button variant="primary" onPress={() => setAddOpen(true)}>
            Add Product
          </Button>
        }
      />

      {products === null ? (
        <p className="text-sm text-default-500" role="status" aria-live="polite">
          Loading products…
        </p>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create the first product to start managing inventory."
          action={
            <Button variant="primary" onPress={() => setAddOpen(true)}>
              Add Product
            </Button>
          }
        />
      ) : (
        <DataTableShell label="Products">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Products table">
                <Table.Header>
                  <Table.Column isRowHeader>ID</Table.Column>
                  <Table.Column>NAME</Table.Column>
                  <Table.Column>CATEGORY</Table.Column>
                  <Table.Column>DESCRIPTION</Table.Column>
                  <Table.Column>PRICE</Table.Column>
                  <Table.Column>STOCK</Table.Column>
                </Table.Header>
                <Table.Body>
                  {products.map((p: any) => (
                    <Table.Row
                      key={p.id}
                      className="cursor-pointer"
                      onAction={() => navigate(`/ims/products/${p.id}`)}
                    >
                      <Table.Cell className="tabular-nums text-default-500">{p.id}</Table.Cell>
                      <Table.Cell className="font-medium">{p.name}</Table.Cell>
                      <Table.Cell>{p.category || '—'}</Table.Cell>
                      <Table.Cell className="max-w-xs truncate text-default-500">
                        {p.description || '—'}
                      </Table.Cell>
                      <Table.Cell className="tabular-nums">${p.price?.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" color={p.stock > 0 ? 'success' : 'danger'}>
                          <Chip.Label className="tabular-nums">{p.stock}</Chip.Label>
                        </Chip>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </DataTableShell>
      )}

      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          loadProducts();
        }}
      />
    </div>
  );
}
