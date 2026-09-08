import { useEffect, useState } from 'react';
import { Table, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(data));
  }, [currentUser.id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Order History</h1>
      </div>

      <Table>
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
                  <Table.Cell>{o.id}</Table.Cell>
                  <Table.Cell className="font-medium">{o.productName}</Table.Cell>
                  <Table.Cell>
                    <Chip size="sm" color={o.status === 'CREATED' ? 'success' : 'default'}>
                      <Chip.Label>{o.status}</Chip.Label>
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>${o.totalAmount?.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
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
