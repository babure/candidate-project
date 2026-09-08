import { useEffect, useMemo, useState } from 'react';
import { Table, Chip, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DataTableShell from '../../components/ui/DataTableShell';
import { CardGridSkeleton, TableListSkeleton } from '../../components/ui/LoadingSkeletons';
import {
  SortableHeaderButton,
  nextSortState,
  type SortDir,
} from '../../components/ui/SortableHeaderButton';
import { PRODUCT_CATEGORIES } from '../../lib/validation';

type SortField = 'name' | 'price';
type AvailabilityFilter = 'all' | 'in' | 'out';
type ViewMode = 'table' | 'cards';

const controlClass =
  'h-9 rounded-lg border border-default-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent';

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10M15 10v10" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export default function StoreProductListPage() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [view, setView] = useState<ViewMode>('table');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/store/products')
      .then((r) => r.json())
      .then((data) => setProducts(data));
  }, []);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setPriceMin('');
    setPriceMax('');
    setAvailability('all');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'all' ||
    priceMin !== '' ||
    priceMax !== '' ||
    availability !== 'all';

  const toggleSort = (field: SortField) => {
    const next = nextSortState(sortField, sortDir, field, field === 'price' ? 'asc' : 'asc');
    setSortField(next.field);
    setSortDir(next.direction);
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    const min = priceMin === '' ? null : Number(priceMin);
    const max = priceMax === '' ? null : Number(priceMax);

    let list = products.filter((p) => {
      if (q) {
        const hay = `${p.name || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== 'all' && p.category !== category) return false;
      if (min != null && Number.isFinite(min) && (p.price ?? 0) < min) return false;
      if (max != null && Number.isFinite(max) && (p.price ?? 0) > max) return false;
      if (availability === 'in' && !p.inStock) return false;
      if (availability === 'out' && p.inStock) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = String(a.name || '').localeCompare(String(b.name || ''));
      } else {
        cmp = (a.price ?? 0) - (b.price ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [products, search, category, priceMin, priceMax, availability, sortField, sortDir]);

  const viewToggle = (
    <div className="flex shrink-0 overflow-hidden rounded-lg border border-default-200">
      <button
        type="button"
        aria-label="Table view"
        aria-pressed={view === 'table'}
        onClick={() => setView('table')}
        className={[
          'inline-flex size-9 cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent',
          view === 'table' ? 'bg-default-100 text-foreground' : 'bg-white text-default-500 hover:bg-default-50',
        ].join(' ')}
      >
        <TableIcon />
      </button>
      <button
        type="button"
        aria-label="Cards view"
        aria-pressed={view === 'cards'}
        onClick={() => setView('cards')}
        className={[
          'inline-flex size-9 cursor-pointer items-center justify-center border-l border-default-200 outline-none focus-visible:ring-2 focus-visible:ring-accent',
          view === 'cards' ? 'bg-default-100 text-foreground' : 'bg-white text-default-500 hover:bg-default-50',
        ].join(' ')}
      >
        <CardsIcon />
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        description="Browse available products and check stock status."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          id="catalog-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className={`min-w-[12rem] flex-1 ${controlClass}`}
        />
        <select
          id="catalog-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={controlClass}
        >
          <option value="all">All categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          id="catalog-availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
          aria-label="Filter by availability"
          className={controlClass}
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <input
          id="catalog-price-min"
          type="number"
          min={0}
          step="0.01"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          placeholder="Min $"
          aria-label="Minimum price"
          className={`w-24 ${controlClass}`}
        />
        <input
          id="catalog-price-max"
          type="number"
          min={0}
          step="0.01"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder="Max $"
          aria-label="Maximum price"
          className={`w-24 ${controlClass}`}
        />
        {hasActiveFilters ? (
          <Button size="sm" variant="ghost" onPress={clearFilters}>
            Clear
          </Button>
        ) : null}
        <div className="ml-auto">{viewToggle}</div>
      </div>

      {view === 'cards' && filtered.length > 0 ? (
        <div className="mb-3 flex items-center gap-3 text-sm text-default-500">
          <span>Sort:</span>
          <button
            type="button"
            className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => toggleSort('name')}
          >
            Name {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
          </button>
          <button
            type="button"
            className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => toggleSort('price')}
          >
            Price {sortField === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
          </button>
        </div>
      ) : null}

      {products === null ? (
        view === 'cards' ? <CardGridSkeleton /> : <TableListSkeleton cols={5} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products available"
          description="There are no products in the catalog right now. Check back later."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching products"
          description="Try adjusting search or filters to see more results."
          action={
            hasActiveFilters ? (
              <Button variant="primary" onPress={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: any) => (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/oms/catalog/${p.id}`)}
              className="cursor-pointer rounded-lg border border-default-200 bg-white p-4 text-left outline-none transition-colors hover:border-default-300 hover:bg-default-50 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="text-balance font-semibold text-foreground">{p.name}</h2>
                <Chip size="sm" color={p.inStock ? 'success' : 'danger'}>
                  <Chip.Label>{p.inStock ? 'In stock' : 'Out of stock'}</Chip.Label>
                </Chip>
              </div>
              <p className="mb-1 text-sm text-default-500">{p.category || '—'}</p>
              <p className="line-clamp-2 text-pretty text-sm text-default-500">
                {p.description || 'No description'}
              </p>
              <p className="mt-3 font-medium tabular-nums">${p.price?.toFixed(2)}</p>
            </button>
          ))}
        </div>
      ) : (
        <DataTableShell label="Product catalog">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Store products table">
                <Table.Header>
                  <Table.Column isRowHeader>ID</Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Name"
                      active={sortField === 'name'}
                      direction={sortDir}
                      onClick={() => toggleSort('name')}
                    />
                  </Table.Column>
                  <Table.Column>CATEGORY</Table.Column>
                  <Table.Column>
                    <SortableHeaderButton
                      label="Price"
                      active={sortField === 'price'}
                      direction={sortDir}
                      onClick={() => toggleSort('price')}
                    />
                  </Table.Column>
                  <Table.Column>AVAILABILITY</Table.Column>
                </Table.Header>
                <Table.Body>
                  {filtered.map((p: any) => (
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
