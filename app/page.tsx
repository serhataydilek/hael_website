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
          <p className="eyebrow">PEYAM / COLLECTION 001 / 2026</p>
          <h1>Garments<br />for quiet<br />structures.</h1>
          <div className="hero-meta">
            <p>Ten studies in black cotton. Weight, proportion and construction reduced to their necessary form.</p>
            <Link className="text-link" href="/shop">Enter collection <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="hero-image">
          <Image src="/hero-architecture.png" alt="Model wearing a black T-shirt in a concrete interior" fill priority sizes="(max-width: 768px) 100vw, 59vw" />
          <figcaption>Study 01 / Concrete volume</figcaption>
        </figure>
      </section>

      <section className="collection-intro page-shell">
        <p className="eyebrow">COLLECTION 001 — SYSTEM / FORM</p>
        <p className="collection-statement">A single garment examined through ten calibrated variations. Built for repetition, movement and the architecture of everyday use.</p>
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
        <p className="eyebrow">OPERATING PRINCIPLES</p>
        <p>We make fewer things, with more attention. Each garment begins with material, then follows the body—never the spectacle around it.</p>
        <Link className="text-link" href="/shop">View all ten studies <span aria-hidden="true">→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
