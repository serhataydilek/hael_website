'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCart, writeCart, type CartLine } from '@/lib/cart';
import { products } from '@/lib/products';

export function CartView() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    queueMicrotask(() => { setLines(readCart()); setReady(true); });
  }, []);
  const update = (next: CartLine[]) => { setLines(next); writeCart(next); };
  const total = lines.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0);

  return <section className="cart-page page-shell"><header><p className="eyebrow">CURRENT SELECTION</p><h1>Bag / {String(lines.reduce((sum, line) => sum + line.quantity, 0)).padStart(2, '0')}</h1></header>
    {!ready ? <p className="cart-empty">Loading bag…</p> : lines.length === 0 ? <div className="cart-empty"><p>Your selection is empty.</p><Link className="text-link" href="/shop">Enter collection →</Link></div> : <>
      <div className="cart-lines">{lines.map((line, index) => { const product = products.find((item) => item.id === line.productId); if (!product) return null; return <article className="cart-line" key={`${line.productId}-${line.size}`}>
        <span className="line-index">{String(index + 1).padStart(2, '0')}</span><Link className="cart-thumb" href={`/product/${product.slug}`}><Image src={product.images[0]} alt="" fill sizes="160px" /></Link>
        <div className="cart-name"><p>{product.name}</p><span>{product.id} / BLACK</span></div><div className="cart-size"><span>SIZE</span><strong>{line.size}</strong></div>
        <div className="quantity"><span>QTY</span><div><button aria-label={`Decrease ${product.name} quantity`} onClick={() => update(line.quantity === 1 ? lines.filter((item) => item !== line) : lines.map((item) => item === line ? { ...item, quantity: item.quantity - 1 } : item))}>−</button><strong>{line.quantity}</strong><button aria-label={`Increase ${product.name} quantity`} onClick={() => update(lines.map((item) => item === line ? { ...item, quantity: item.quantity + 1 } : item))}>+</button></div></div>
        <p className="line-price">€{product.price * line.quantity}</p><button className="remove-line" onClick={() => update(lines.filter((item) => item !== line))}>Remove</button>
      </article>; })}</div>
      <aside className="cart-summary"><div><span>SUBTOTAL</span><strong>€{total}</strong></div><p>Taxes included. Delivery calculated in the next phase.</p><button type="button" disabled>CHECKOUT / PHASE 2</button></aside>
    </>}
  </section>;
}
