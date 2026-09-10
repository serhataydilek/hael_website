'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DecodedText } from '@/components/decoded-text';
import { useStorefront } from '@/components/storefront-experience';
import { products } from '@/lib/products';

export function CartView() {
  const { lines, ready, updateCart: update } = useStorefront();
  const total = lines.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0);

  return <section className="cart-page page-shell"><header><DecodedText as="p" className="eyebrow" text="CURRENT SELECTION" trigger="inView" duration={0.36} decodeId="cart-eyebrow" /><h1><DecodedText text="Bag /" trigger="inView" duration={0.48} decodeId="cart-title" /> {String(lines.reduce((sum, line) => sum + line.quantity, 0)).padStart(2, '0')}</h1></header>
    {!ready ? <p className="cart-empty">Loading bag…</p> : lines.length === 0 ? <div className="cart-empty"><DecodedText as="p" text="Your selection is empty." trigger="inView" duration={0.4} decodeId="cart-empty" /><Link className="text-link" href="/shop" aria-label="Enter collection"><DecodedText text="Enter collection" trigger="inView" duration={0.32} hover accessible={false} decodeId="cart-enter" /> <span aria-hidden="true">→</span></Link></div> : <>
      <div className="cart-lines">{lines.map((line, index) => { const product = products.find((item) => item.id === line.productId); if (!product) return null; return <article className="cart-line" key={`${line.productId}-${line.size}`}>
        <span className="line-index">{String(index + 1).padStart(2, '0')}</span><Link className="cart-thumb" href={`/product/${product.slug}`}><Image src={product.images[0]} alt="" fill sizes="160px" unoptimized style={{ objectFit: 'contain', objectPosition: 'center' }} /></Link>
        <div className="cart-name"><p>{product.name}</p><span>{product.id} / BLACK</span></div><div className="cart-size"><DecodedText text="SIZE" trigger="inView" duration={0.28} decodeId={`cart-size-label-${index}`} /><strong>{line.size}</strong></div>
        <div className="quantity"><DecodedText text="QTY" trigger="inView" duration={0.28} decodeId={`cart-qty-label-${index}`} /><div><button aria-label={`Decrease ${product.name} quantity`} onClick={() => update(line.quantity === 1 ? lines.filter((item) => item !== line) : lines.map((item) => item === line ? { ...item, quantity: item.quantity - 1 } : item))}>−</button><strong>{line.quantity}</strong><button aria-label={`Increase ${product.name} quantity`} onClick={() => update(lines.map((item) => item === line ? { ...item, quantity: item.quantity + 1 } : item))}>+</button></div></div>
        <p className="line-price">€{product.price * line.quantity}</p><button className="remove-line" onClick={() => update(lines.filter((item) => item !== line))}>Remove</button>
      </article>; })}</div>
      <aside className="cart-summary"><div><DecodedText text="SUBTOTAL" trigger="inView" duration={0.3} decodeId="cart-subtotal" /><strong>€{total}</strong></div><p>Taxes included. Delivery calculated in the next phase.</p><button type="button" disabled><DecodedText text="CHECKOUT / PHASE 2" trigger="inView" duration={0.36} decodeId="cart-checkout" /></button></aside>
    </>}
  </section>;
}
