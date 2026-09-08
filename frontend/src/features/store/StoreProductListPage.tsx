import { useEffect, useState } from 'react';
import { Table, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';

export default function StoreProductListPage() {
  const [products, setProducts] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/store/products')
      .then((r) => r.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        description="Browse available products and check stock status."
      />

      {products === null ? (
        <p className="text-sm text-default-500" role="status" aria-live="polite">
          Loading catalog…
        </p>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products available"
          description="There are no products in the catalog right now. Check back later."
        />
      ) : (
        <DataTableShell label="Product catalog">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Store products table">
                <Table.Header>
                  <Table.Column isRowHeader>ID</Table.Column>
                  <Table.Column>NAME</Table.Column>
                  <Table.Column>CATEGORY</Table.Column>
                  <Table.Column>PRICE</Table.Column>
                  <Table.Column>AVAILABILITY</Table.Column>
                </Table.Header>
                <Table.Body>
                  {products.map((p: any) => (
                    <Table.Row
                      key={p.id}
                      className="cursor-pointer"
                      onAction={() => navigate(`/oms/catalog/${p.id}`)}
                    >
                      <Table.Cell className="tabular-nums text-default-500">{p.id}</Table.Cell>
                      <Table.Cell className="font-medium">{p.name}</Table.Cell>
                      <Table.Cell>{p.category || '—'}</Table.Cell>
                      <Table.Cell className="tabular-nums">${p.price?.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" color={p.inStock ? 'success' : 'danger'}>
                          <Chip.Label>{p.inStock ? 'In stock' : 'Out of stock'}</Chip.Label>
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
    </div>
  );
}
