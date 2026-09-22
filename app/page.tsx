import { HomeHero } from '@/components/home-hero';
import { ProductTile } from '@/components/product-tile';
import { SiteFooter } from '@/components/site-footer';
import { products } from '@/lib/products';
import Link from 'next/link';

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <main className="home">
      <HomeHero />

      <section className="merch home-collection" aria-label="Drop 001">
        <div className="merch-head">
          <h2>
            <Link href="/shop">Drop 001</Link>
          </h2>
          <Link className="view-all" href="/shop">
            View all
          </Link>
        </div>
        <ul className="merch-grid home-product-grid">
          {featured.map((product) => (
            <li key={product.id}>
              <ProductTile
                product={product}
                sizes="(max-width: 1099px) 46vw, 24vw"
              />
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
