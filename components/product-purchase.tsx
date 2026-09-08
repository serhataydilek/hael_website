'use client';

import { useState } from 'react';
import { addCartLine } from '@/lib/cart';
import type { Product, Size } from '@/lib/products';

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<Size | null>(null);
  const [message, setMessage] = useState('');

  const add = () => {
    if (!size) { setMessage('Select a size'); return; }
    addCartLine(product.id, size);
    setMessage(`${product.name} / ${size} added`);
  };

  return (
    <div className="purchase-block">
      <div className="size-heading"><span>SELECT SIZE</span><span>SIZE GUIDE ↗</span></div>
      <fieldset className="size-grid" aria-label="Select size">
        {product.sizes.map((value) => <button className={size === value ? 'selected' : ''} key={value} onClick={() => { setSize(value); setMessage(''); }} type="button" aria-pressed={size === value}>{value}</button>)}
      </fieldset>
      <button className="add-button" onClick={add} type="button">ADD TO BAG <span>€{product.price}</span></button>
      <p className="purchase-message" aria-live="polite">{message}</p>
    </div>
  );
}
