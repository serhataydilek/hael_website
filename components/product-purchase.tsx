'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product, Size } from '@/lib/products';
import { useStorefront } from '@/components/storefront-experience';

export function ProductPurchase({ product, unavailableSizes = [] }: { product: Product; unavailableSizes?: readonly Size[] }) {
  const [size, setSize] = useState<Size | null>(null);
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);
  const resetAdded = useRef<number | null>(null);
  const { addItem } = useStorefront();

  useEffect(() => () => {
    if (resetAdded.current) window.clearTimeout(resetAdded.current);
  }, []);

  const add = () => {
    if (!size) { setMessage('Select a size'); return; }
    addItem(product.id, size);
    setAdded(true);
    setMessage(`${product.name} / ${size} added`);
    if (resetAdded.current) window.clearTimeout(resetAdded.current);
    resetAdded.current = window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="purchase-block">
      <div className="size-heading"><span>SELECT SIZE</span><span>SIZE GUIDE ↗</span></div>
      <fieldset className="size-grid" aria-label="Select size">
        {product.sizes.map((value) => {
          const unavailable = unavailableSizes.includes(value);
          return <button className={size === value ? 'selected' : ''} key={value} onClick={() => { setSize(value); setMessage(''); }} type="button" aria-pressed={size === value} aria-label={`Size ${value}`} disabled={unavailable} aria-disabled={unavailable}>{value}</button>;
        })}
      </fieldset>
      <button className="add-button" data-added={added} onClick={add} type="button"><span className="add-button-label" key={added ? 'added' : 'add'}>{added ? 'ADDED' : 'ADD TO BAG'}</span><span>€{product.price}</span></button>
      <p className="purchase-message" aria-live="polite">{message}</p>
    </div>
  );
}
