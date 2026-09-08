import { useEffect, useState } from 'react';
import { Table, Chip, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setOrders(null);
    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(data));
  }, [currentUser.id]);

  return (
    <div>
      <PageHeader
        title="Order History"
        description={`Orders placed by ${currentUser.name}.`}
      />

      {orders === null ? (
        <p className="text-sm text-default-500" role="status" aria-live="polite">
          Loading orders…
        </p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order from the catalog, it will show up here."
          action={
            <Button variant="primary" onPress={() => navigate('/oms/catalog')}>
              Browse catalog
            </Button>
          }
        />
      ) : (
        <DataTableShell label="Orders">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Orders table">
                <Table.Header>
                  <Table.Column isRowHeader>ID</Table.Column>
                  <Table.Column>PRODUCT</Table.Column>
                  <Table.Column>STATUS</Table.Column>
                  <Table.Column>TOTAL</Table.Column>
                  <Table.Column>DATE</Table.Column>
                </Table.Header>
                <Table.Body>
                  {orders.map((o: any) => (
                    <Table.Row
                      key={o.id}
                      className="cursor-pointer"
                      onAction={() => navigate(`/oms/orders/${o.id}`)}
                    >
                      <Table.Cell className="tabular-nums text-default-500">{o.id}</Table.Cell>
                      <Table.Cell className="font-medium">{o.productName}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" color={o.status === 'CREATED' ? 'success' : 'default'}>
                          <Chip.Label>{o.status}</Chip.Label>
                        </Chip>
                      </Table.Cell>
                      <Table.Cell className="tabular-nums">${o.totalAmount?.toFixed(2)}</Table.Cell>
                      <Table.Cell className="text-default-500">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
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
