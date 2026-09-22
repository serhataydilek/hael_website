import { products, sizes, type Size } from './products';

export type CartLine = { productId: string; size: Size; quantity: number };
export const CART_KEY = 'hael-cart';

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as CartLine;
  return (
    typeof line.productId === 'string' &&
    products.some((product) => product.id === line.productId) &&
    sizes.includes(line.size) &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    // Drop stale placeholder product IDs instead of crashing during catalog swaps.
    return Array.isArray(value) ? value.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines.filter(isCartLine)));
  window.dispatchEvent(new Event('hael-cart-updated'));
}

export function addCartLine(productId: string, size: Size, quantity = 1) {
  const lines = readCart();
  const existing = lines.find(
    (line) => line.productId === productId && line.size === size,
  );
  if (existing) existing.quantity += quantity;
  else lines.push({ productId, size, quantity });
  writeCart(lines);
  return lines;
}
