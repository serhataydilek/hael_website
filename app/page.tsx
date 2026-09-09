import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <main>
      <SiteHeader variant="home" />
      <section className="campaign-hero" aria-labelledby="campaign-title">
        <h1 id="campaign-title" className="visually-hidden">HAEL Collection 001</h1>
        <figure className="campaign-image">
          <Image src="/hael-campaign-01.png" alt="Model wearing HAEL's black graphic long-sleeve top in a dark studio" fill priority sizes="100vw" />
        </figure>
        <p className="campaign-control campaign-collection">Collection / 001</p>
        <Link className="campaign-control campaign-enter" href="/shop">Enter collection <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="collection-intro page-shell" id="collection">
        <p className="eyebrow">Collection / 001</p>
        <h2 className="collection-statement">Garments for<br />altered proportions.</h2>
        <div className="collection-index" aria-label="Collection details"><span>10 objects</span><span>2026</span></div>
      </section>

      <section className="home-products page-shell" id="lookbook" aria-label="Collection 001 lookbook">
        {products.slice(0, 3).map((product, index) => (
          <Link className={`home-product home-product-${index + 1}`} href={`/product/${product.slug}`} key={product.id}>
            <div className="product-study">
              <Image src={product.images[index % product.images.length]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 45vw" />
              <span className="image-index">0{index + 1}</span>
            </div>
            <div className="product-caption">
              <span>{product.id}</span><span>{product.name}</span><span>{product.gsm} GSM</span><span>€{product.price}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="manifesto page-shell" aria-label="HAEL field notes">
        <p className="eyebrow">HAEL / FIELD NOTES</p>
        <p>Built from abrasion, repetition, and the trace a body leaves behind. The graphic is not decoration. It is the evidence.</p>
        <Link className="text-link" href="/shop">View the complete drop <span aria-hidden="true">→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
