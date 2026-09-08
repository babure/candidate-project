import { useEffect, useMemo, useState } from 'react';
import { Table, Chip, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';
import { TableListSkeleton } from '../../components/ui/LoadingSkeletons';
import {
  SortableHeaderButton,
  nextSortState,
  type SortDir,
} from '../../components/ui/SortableHeaderButton';

type SortField = 'id' | 'name' | 'status' | 'total' | 'date';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setOrders(null);
    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(data));
  }, [currentUser.id]);

  const toggleSort = (field: SortField) => {
    const preferred: SortDir = field === 'date' || field === 'total' || field === 'id' ? 'desc' : 'asc';
    const next = nextSortState(sortField, sortDir, field, preferred);
    setSortField(next.field);
    setSortDir(next.direction);
  };

  const sorted = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'id':
          cmp = (a.id ?? 0) - (b.id ?? 0);
          break;
        case 'name':
          cmp = String(a.productName || '').localeCompare(String(b.productName || ''));
          break;
        case 'status':
          cmp = String(a.status || '').localeCompare(String(b.status || ''));
          break;
        case 'total':
          cmp = (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
          break;
        case 'date':
        default:
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [orders, sortField, sortDir]);

  return (
    <div>
      <PageHeader
        title="Order History"
        description={`Orders placed by ${currentUser.name}.`}
      />

      {orders === null ? (
        <TableListSkeleton cols={5} />
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
                  <Table.Column isRowHeader>
                    <SortableHeaderButton
                      label="ID"
                      active={sortField === 'id'}
                      direction={sortDir}
                      onClick={() => toggleSort('id')}
                    />
                  </Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Product"
                      active={sortField === 'name'}
                      direction={sortDir}
                      onClick={() => toggleSort('name')}
                    />
                  </Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Status"
                      active={sortField === 'status'}
                      direction={sortDir}
                      onClick={() => toggleSort('status')}
                    />
                  </Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Total"
                      active={sortField === 'total'}
                      direction={sortDir}
                      onClick={() => toggleSort('total')}
                    />
                  </Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Date"
                      active={sortField === 'date'}
                      direction={sortDir}
                      onClick={() => toggleSort('date')}
                    />
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {sorted.map((o: any) => (
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
