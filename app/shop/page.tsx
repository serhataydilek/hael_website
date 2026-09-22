import { ShopCatalog } from '@/components/shop-catalog';
import { SiteFooter } from '@/components/site-footer';
import { products } from '@/lib/products';

export const metadata = { title: 'Drop 001' };

export default function ShopPage() {
  return (
    <main>
      <ShopCatalog products={products} />
      <SiteFooter />
    </main>
  );
}
