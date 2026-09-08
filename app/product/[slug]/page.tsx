import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProductPurchase } from '@/components/product-purchase';
import { SiteHeader } from '@/components/site-header';
import { getProduct, products } from '@/lib/products';

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? 'Product', description: product?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <main><SiteHeader /><div className="product-layout">
    <section className="product-gallery" aria-label={`${product.name} images`}>
      {product.images.map((source, index) => <figure key={source}><Image src={source} alt={`${product.name}, view ${index + 1}`} fill priority={index === 0} sizes="(max-width: 900px) 100vw, 66vw" /><span>VIEW / 0{index + 1}</span></figure>)}
    </section>
    <aside className="product-panel"><div className="product-code"><span>{product.id}</span><span>COL / 001</span></div><h1>{product.name}</h1><p className="product-description">{product.description}</p>
      <dl><div><dt>MATERIAL</dt><dd>{product.material}</dd></div><div><dt>WEIGHT</dt><dd>{product.gsm} GSM</dd></div><div><dt>FIT</dt><dd>{product.fit}</dd></div><div><dt>ORIGIN</dt><dd>Made in Türkiye</dd></div></dl>
      <ProductPurchase product={product} /><p className="care-note">Cold wash / dry flat / wear repeatedly</p>
    </aside>
  </div></main>;
}
