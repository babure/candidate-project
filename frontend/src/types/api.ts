export type OrderStatus = 'CREATED' | 'CANCELLED';

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreProduct = {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  inStock: boolean;
};

export type Order = {
  id: number;
  status: OrderStatus;
  userId: number;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt?: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function formatMoney(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toFixed(2);
}
