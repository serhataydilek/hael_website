'use client';

import { useEffect, useRef, useState } from 'react';
import { SizeGuide } from '@/components/size-guide';
import { useStorefront } from '@/components/storefront-experience';
import type { Product, Size } from '@/lib/products';

export function ProductPurchase({
  product,
  unavailableSizes = [],
}: {
  product: Product;
  unavailableSizes?: readonly Size[];
}) {
  const [size, setSize] = useState<Size | null>(null);
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const reset = useRef<number | null>(null);
  const { addItem } = useStorefront();

  useEffect(
    () => () => {
      if (reset.current) window.clearTimeout(reset.current);
    },
    [],
  );

  const add = () => {
    if (!size) {
      setMessage('Select a size');
      return;
    }
    addItem(product.id, size);
    setAdded(true);
    setMessage(`${product.name} / ${size} added`);
    if (reset.current) window.clearTimeout(reset.current);
    reset.current = window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="pdp-buy">
      <div className="size-row">
        <span>Select size</span>
        <button
          className="size-guide-trigger"
          type="button"
          onClick={() => setGuideOpen(true)}
        >
          Size guide
        </button>
      </div>
      <fieldset className="size-grid" aria-label="Select size">
        {product.sizes.map((value) => {
          const unavailable = unavailableSizes.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={size === value ? 'selected' : ''}
              onClick={() => {
                setSize(value);
                setMessage('');
              }}
              aria-pressed={size === value}
              aria-label={`Size ${value}`}
              disabled={unavailable}
            >
              {value}
            </button>
          );
        })}
      </fieldset>
      <p className="pdp-price">€{product.price}</p>
      <button
        className="add-button"
        type="button"
        data-added={added}
        data-ready={Boolean(size)}
        onClick={add}
      >
        {added ? 'Added' : size ? 'Add to bag' : 'Select size'}
      </button>
      <p className="purchase-message" aria-live="polite">
        {message}
      </p>
      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
