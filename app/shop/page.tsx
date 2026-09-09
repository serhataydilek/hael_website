import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ShopCatalog } from '@/components/shop-catalog';
import { products } from '@/lib/products';

export const metadata = { title: 'Drop 001' };

export default function ShopPage() {
  return <main className="shop-page"><SiteHeader /><header className="shop-heading page-shell"><h1>Drop 001 <span>({products.length})</span></h1></header>
    <ShopCatalog products={products} />
    <SiteFooter /></main>;
}
