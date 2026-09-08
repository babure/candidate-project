import { useEffect, useState } from 'react';
import { Table, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

export default function StoreProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/store/products')
      .then((r) => r.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Product Catalog</h1>
      </div>

      <Table>
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
                  <Table.Cell>{p.id}</Table.Cell>
                  <Table.Cell className="font-medium">{p.name}</Table.Cell>
                  <Table.Cell>{p.category || '—'}</Table.Cell>
                  <Table.Cell>${p.price?.toFixed(2)}</Table.Cell>
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
    </div>
  );
}
