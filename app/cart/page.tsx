import { CartView } from '@/components/cart-view';
import { SiteFooter } from '@/components/site-footer';

export const metadata = { title: 'Bag' };

export default function CartPage() {
  return (
    <main>
      <CartView />
      <SiteFooter />
    </main>
  );
}
