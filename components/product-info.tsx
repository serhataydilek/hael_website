'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';

export function ProductInfo({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pdp-acc">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Product information
        <span aria-hidden="true">{open ? '–' : '+'}</span>
      </button>
      {open ? (
        <dl>
          <div>
            <dt>Material</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{product.gsm} GSM</dd>
          </div>
          <div>
            <dt>Fit</dt>
            <dd>{product.fit}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
