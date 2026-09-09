import type { Size } from './products';

export type CartLine = { productId: string; size: Size; quantity: number };
export const CART_KEY = 'hael-cart';

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event('hael-cart-updated'));
}

export function addCartLine(productId: string, size: Size, quantity = 1) {
  const lines = readCart();
  const existing = lines.find((line) => line.productId === productId && line.size === size);
  if (existing) existing.quantity += quantity;
  else lines.push({ productId, size, quantity });
  writeCart(lines);
  return lines;
}
