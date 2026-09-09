import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <section className="editorial-hero">
        <div className="hero-copy">
          <p className="eyebrow">HAEL / DROP 001 / 2026</p>
          <h1>Worn<br />after<br />dark.</h1>
          <div className="hero-meta">
            <p>Three black garments pulled from sketches into the night. Bleached marks, mesh, and distorted portraits.</p>
            <Link className="text-link" href="/shop">Enter drop <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="hero-image">
          <Image src="/hael-campaign-01.png" alt="Model wearing HAEL's black graphic long-sleeve top in a dark studio" fill priority sizes="(max-width: 768px) 100vw, 59vw" />
          <figcaption>Frame 01 / Afterimage</figcaption>
        </figure>
      </section>

      <section className="collection-intro page-shell">
        <p className="eyebrow">DROP 001 — SIGNAL / SHADOW</p>
        <p className="collection-statement">A study in altered surfaces. Three silhouettes carry marks that emerge, disappear, and return under light.</p>
      </section>

      <section className="home-products page-shell" aria-label="Selected products">
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

      <section className="manifesto page-shell">
        <p className="eyebrow">HAEL / FIELD NOTES</p>
        <p>Built from abrasion, repetition, and the trace a body leaves behind. The graphic is not decoration. It is the evidence.</p>
        <Link className="text-link" href="/shop">View the complete drop <span aria-hidden="true">→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
