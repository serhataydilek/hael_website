import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { products } from '@/lib/products';

export const metadata = { title: 'Collection 001' };

export default function ShopPage() {
  return <main><SiteHeader /><header className="shop-heading page-shell"><p className="eyebrow">ARCHIVE / CURRENT</p><h1>Collection<br />001</h1><div><span>10 OBJECTS</span><span>BLACK / COTTON</span><span>2026.09</span></div></header>
    <section className="catalog page-shell" aria-label="Collection 001 products">
      {products.map((product, index) => <Link className={`catalog-item catalog-item-${index % 4}`} href={`/product/${product.slug}`} key={product.id}>
        <div className="catalog-image"><Image src={product.images[index % product.images.length]} alt={product.name} fill sizes="(max-width: 700px) 100vw, 45vw" /><span>NO. {String(index + 1).padStart(2, '0')}</span></div>
        <div className="catalog-info"><p><span>{product.id}</span><strong>{product.name}</strong></p><p>{product.fit}<br />{product.gsm} GSM</p><span>€{product.price}</span></div>
      </Link>)}
    </section><SiteFooter /></main>;
}
