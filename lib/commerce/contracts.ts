import type { CartLine } from '../cart';
import type { Product, Size } from '../products';

export interface CatalogRepository {
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
}

export interface InventoryService {
  getAvailableQuantity(productId: string, size: Size): Promise<number>;
}

export interface OrderDraft { lines: CartLine[]; currency: 'EUR'; }
export interface OrderService { createOrder(draft: OrderDraft): Promise<{ id: string }>; }
export interface CheckoutService { createCheckout(orderId: string): Promise<{ redirectUrl: string }>; }
