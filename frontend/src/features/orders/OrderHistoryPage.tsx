import { useEffect, useState } from 'react';
import { Table, Chip, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import PageHeader from '../../components/ui/PageHeader';
import { NavIcons } from '../../components/ui/NavIcons';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';
import { TableListSkeleton } from '../../components/ui/LoadingSkeletons';
import {
  SortableHeaderButton,
  nextSortState,
  type SortDir,
} from '../../components/ui/SortableHeaderButton';
import {
  PaginationBar,
  DEFAULT_PAGE_SIZE,
} from '../../components/ui/PaginationBar';
import { parsePositiveInt, useUrlQueryState } from '../../hooks/useUrlQueryState';
import { formatMoney } from '../../types/api';

type SortField = 'id' | 'name' | 'status' | 'total' | 'date';

type PagePayload = {
  items: any[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const ORDER_DEFAULTS = {
  sort: 'date',
  dir: 'desc',
  page: '1',
  pageSize: String(DEFAULT_PAGE_SIZE),
};

function isSortField(v: string): v is SortField {
  return v === 'id' || v === 'name' || v === 'status' || v === 'total' || v === 'date';
}

function isSortDir(v: string): v is SortDir {
  return v === 'asc' || v === 'desc';
}

export default function OrderHistoryPage() {
  const [pageData, setPageData] = useState<PagePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { values, setValues, queryString } = useUrlQueryState(ORDER_DEFAULTS);
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const sortField = isSortField(values.sort) ? values.sort : 'date';
  const sortDir = isSortDir(values.dir) ? values.dir : 'desc';
  const pageSize = parsePositiveInt(values.pageSize, DEFAULT_PAGE_SIZE);
  const page = parsePositiveInt(values.page, 1);

  // Clear stale list when switching dummy users so we never flash another user's empty state as "No orders yet".
  useEffect(() => {
    setPageData(null);
    setIsLoading(true);
    setLoadError('');
  }, [currentUser.id]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('userId', String(currentUser.id));
    params.set('sort', sortField);
    params.set('dir', sortDir);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');

    fetch(`/api/orders?${params.toString()}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || 'Failed to load orders');
        }
        return r.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data)
              ? data
              : [];
        const totalItems =
          typeof data?.totalItems === 'number'
            ? data.totalItems
            : typeof data?.totalElements === 'number'
              ? data.totalElements
              : items.length;

        setPageData({
          items,
          page: data?.page ?? page,
          pageSize: data?.pageSize ?? pageSize,
          totalItems,
          totalPages:
            typeof data?.totalPages === 'number'
              ? data.totalPages
              : Math.max(1, Math.ceil(totalItems / pageSize)),
        });
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setLoadError(e.message || 'Failed to load orders');
        // Do not invent an empty success payload — that falsely shows "No orders yet".
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [currentUser.id, sortField, sortDir, page, pageSize, reloadKey]);

  useEffect(() => {
    if (!pageData) return;
    if (pageData.totalPages > 0 && page > pageData.totalPages) {
      setValues({ page: String(pageData.totalPages) });
    }
  }, [pageData, page, setValues]);

  const toggleSort = (field: SortField) => {
    const preferred: SortDir = field === 'date' || field === 'total' || field === 'id' ? 'desc' : 'asc';
    const next = nextSortState(sortField, sortDir, field, preferred);
    setValues(
      {
        sort: next.field,
        dir: next.direction,
      },
      { resetPage: true }
    );
  };

  const openOrder = (id: number | string) => {
    navigate(`/oms/orders/${id}`, {
      state: { from: 'orders', listSearch: queryString },
    });
  };

  const items = pageData?.items ?? [];
  const totalItems = pageData?.totalItems ?? 0;
  const showSkeleton = isLoading && pageData === null;
  const showEmpty = !isLoading && !loadError && pageData !== null && totalItems === 0;
  const showLoadFailure = !isLoading && !!loadError && pageData === null;

  return (
    <div>
      <PageHeader
        title="Order History"
        description={`Orders placed by ${currentUser.name}.`}
        icon={<NavIcons.orders />}
      />

      {loadError && pageData !== null ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {showSkeleton ? (
        <TableListSkeleton cols={5} />
      ) : showLoadFailure ? (
        <EmptyState
          title="Couldn't load orders"
          description={loadError || 'Something went wrong while loading orders.'}
          action={
            <Button variant="primary" onPress={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          }
        />
      ) : showEmpty ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order from the catalog, it will show up here."
          action={
            <Button variant="primary" onPress={() => navigate('/oms/catalog')}>
              Browse catalog
            </Button>
          }
        />
      ) : pageData === null ? (
        <TableListSkeleton cols={5} />
      ) : (
        <>
          <div className={isLoading ? 'opacity-60' : ''} aria-busy={isLoading}>
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
                      {items.map((o: any) => (
                        <Table.Row
                          key={o.id}
                          className="cursor-pointer"
                          onAction={() => openOrder(o.id)}
                        >
                          <Table.Cell className="tabular-nums text-default-500">{o.id}</Table.Cell>
                          <Table.Cell className="font-medium">{o.productName}</Table.Cell>
                          <Table.Cell>
                            <Chip size="sm" color={o.status === 'CREATED' ? 'success' : 'default'}>
                              <Chip.Label>{o.status}</Chip.Label>
                            </Chip>
                          </Table.Cell>
                          <Table.Cell className="tabular-nums">${formatMoney(o.totalAmount)}</Table.Cell>
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
          </div>
          <PaginationBar
            page={page}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={(p) => setValues({ page: p === 1 ? null : String(p) })}
          />
        </>
      )}
    </div>
  );
}
