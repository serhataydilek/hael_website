import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ShopCatalog } from '@/components/shop-catalog';
import { products } from '@/lib/products';

export const metadata = { title: 'Drop 001' };

export default function ShopPage() {
  return <main><SiteHeader /><header className="shop-heading page-shell"><p className="eyebrow">HAEL / CURRENT</p><h1>Drop<br />001</h1><div><span>10 OBJECTS</span><span>BLACK / ALTERED</span><span>2026.09</span></div></header>
    <ShopCatalog products={products} />
    <SiteFooter /></main>;
}
