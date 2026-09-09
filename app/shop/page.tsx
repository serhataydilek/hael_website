import { DecodedText } from '@/components/decoded-text';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ShopCatalog } from '@/components/shop-catalog';
import { products } from '@/lib/products';

export const metadata = { title: 'Drop 001' };

export default function ShopPage() {
  return <main className="shop-page"><SiteHeader /><header className="shop-heading page-shell"><h1><DecodedText text="Drop 001" trigger="inView" duration={0.48} decodeId="shop-title" /> <span>({products.length})</span></h1></header>
    <ShopCatalog products={products} />
    <SiteFooter /></main>;
}
