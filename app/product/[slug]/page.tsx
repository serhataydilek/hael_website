import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DecodedText } from '@/components/decoded-text';
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
    <aside className="product-panel"><div className="product-code"><DecodedText text={product.id} trigger="inView" duration={0.34} decodeId={`product-id-${product.id}`} /><DecodedText text="COL / 001" trigger="inView" duration={0.36} delay={0.05} decodeId="product-col" /></div><h1><DecodedText text={product.name} trigger="inView" duration={0.52} decodeId={`product-name-${product.id}`} /></h1><p className="product-description">{product.description}</p>
      <dl><div><dt><DecodedText text="MATERIAL" trigger="inView" duration={0.3} decodeId="dt-material" /></dt><dd>{product.material}</dd></div><div><dt><DecodedText text="WEIGHT" trigger="inView" duration={0.3} decodeId="dt-weight" /></dt><dd>{product.gsm} GSM</dd></div><div><dt><DecodedText text="FIT" trigger="inView" duration={0.28} decodeId="dt-fit" /></dt><dd>{product.fit}</dd></div><div><dt><DecodedText text="ORIGIN" trigger="inView" duration={0.3} decodeId="dt-origin" /></dt><dd>Made in Türkiye</dd></div></dl>
      <ProductPurchase product={product} /><p className="care-note">Cold wash / dry flat / wear repeatedly</p>
    </aside>
  </div></main>;
}
