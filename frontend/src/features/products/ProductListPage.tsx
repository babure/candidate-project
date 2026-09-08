import { useEffect, useState } from 'react';
import { Table, Button, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import AddProductModal from './AddProductModal';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';
import { TableListSkeleton } from '../../components/ui/LoadingSkeletons';
import { fetchJson } from '../../lib/fetchJson';
import { formatMoney, type Product } from '../../types/api';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');

    fetchJson<Product[]>('/api/products', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setLoadError(e.message || 'Failed to load products');
        setProducts((prev) => (prev === null ? [] : prev));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const showSkeleton = isLoading && products === null;
  const showFailure = !isLoading && !!loadError && (products === null || products.length === 0);
  const showEmpty = !isLoading && !loadError && products !== null && products.length === 0;

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

      {loadError && products && products.length > 0 ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {showSkeleton ? (
        <TableListSkeleton cols={6} />
      ) : showFailure ? (
        <EmptyState
          title="Couldn't load products"
          description={loadError || 'Something went wrong while loading products.'}
          action={
            <Button variant="primary" onPress={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          }
        />
      ) : showEmpty ? (
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
        <div className={isLoading ? 'opacity-60' : ''} aria-busy={isLoading}>
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
                    {(products ?? []).map((p) => (
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
                        <Table.Cell className="tabular-nums">${formatMoney(p.price)}</Table.Cell>
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
        </div>
      )}

      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          setReloadKey((k) => k + 1);
        }}
      />
    </div>
  );
}
