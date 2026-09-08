export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_RULES = {
  nameMax: 255,
  descriptionMax: 2000,
  priceMin: 0,
  priceMax: 99999.99,
  stockMax: 999_999,
  quantityMin: 1,
  quantityMax: 999,
} as const;

export function validateProductInput(input: {
  name: string;
  category: string;
  description?: string;
  price: string | number;
}): string | null {
  const name = String(input.name ?? '').trim();
  if (!name) return 'Name is required.';
  if (name.length > PRODUCT_RULES.nameMax) {
    return `Name must be at most ${PRODUCT_RULES.nameMax} characters.`;
  }

  if (!input.category || !PRODUCT_CATEGORIES.includes(input.category as ProductCategory)) {
    return 'Category is required and must be a valid option.';
  }

  const description = input.description ?? '';
  if (description.length > PRODUCT_RULES.descriptionMax) {
    return `Description must be at most ${PRODUCT_RULES.descriptionMax} characters.`;
  }

  const price = typeof input.price === 'number' ? input.price : Number(input.price);
  if (input.price === '' || !Number.isFinite(price)) return 'Price is required.';
  if (price < PRODUCT_RULES.priceMin || price > PRODUCT_RULES.priceMax) {
    return 'Price must be between 0.00 and 99,999.99.';
  }

  return null;
}

export function validateStockAdjust(currentStock: number, amountRaw: string): string | null {
  if (!amountRaw.trim()) return 'Enter an amount to adjust stock.';
  const amount = Number(amountRaw);
  if (!Number.isInteger(amount)) return 'Stock adjustment must be a whole number.';
  const next = currentStock + amount;
  if (next < 0) return 'Stock must not go below zero.';
  if (next > PRODUCT_RULES.stockMax) {
    return `Stock must be at most ${PRODUCT_RULES.stockMax}.`;
  }
  return null;
}

export function validateOrderQuantity(quantityRaw: string): string | null {
  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) {
    return 'Quantity must be a whole number.';
  }
  if (quantity < PRODUCT_RULES.quantityMin) {
    return `Quantity must be at least ${PRODUCT_RULES.quantityMin}.`;
  }
  if (quantity > PRODUCT_RULES.quantityMax) {
    return `Quantity must be at most ${PRODUCT_RULES.quantityMax}.`;
  }
  return null;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
