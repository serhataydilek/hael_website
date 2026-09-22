import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product-gallery';
import { ProductInfo } from '@/components/product-info';
import { ProductPurchase } from '@/components/product-purchase';
import { ProductTile } from '@/components/product-tile';
import { SiteFooter } from '@/components/site-footer';
import { getProduct, getRelatedProducts, products } from '@/lib/products';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProduct((await params).slug);
  return {
    title: product?.name ?? 'Product',
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const related = getRelatedProducts(product.slug);

  return (
    <main>
      <div className="pdp-grid">
        <ProductGallery product={product} />
        <aside className="pdp-copy">
          <Link className="pdp-back" href="/shop">
            Drop 001
          </Link>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <ProductInfo product={product} />
        </aside>
        <ProductPurchase
          product={product}
          unavailableSizes={product.unavailableSizes}
        />
      </div>
      {related.length ? (
        <section className="pdp-related" aria-label="Also in Drop 001">
          <h2>Also in Drop 001</h2>
          <ul className="merch-grid">
            {related.map((item) => (
              <li key={item.id}>
                <ProductTile
                  product={item}
                  sizes="(max-width: 1099px) 46vw, 22vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
