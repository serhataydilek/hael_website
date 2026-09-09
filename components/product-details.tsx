'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';

const detailCopy = (product: Product) => [
  ['MATERIAL', product.material],
  ['CONSTRUCTION', `${product.fit}. Reinforced neckline and calibrated seam placement.`],
  ['CARE', 'Cold wash / dry flat / wear repeatedly. Do not tumble dry.'],
  ['SHIPPING', 'Placeholder: dispatch and delivery timings will be confirmed before the data layer.'],
  ['RETURNS', 'Placeholder: return policy content is awaiting operational confirmation.'],
];

export function ProductDetails({ product }: { product: Product }) {
  const [open, setOpen] = useState<string | null>('MATERIAL');
  return <section className="product-details" aria-label="Product information">
    {detailCopy(product).map(([title, copy]) => <article key={title} data-open={open === title}>
      <button type="button" aria-expanded={open === title} onClick={() => setOpen(open === title ? null : title)}><span>{title}</span><span aria-hidden="true">{open === title ? '−' : '+'}</span></button>
      <div className="detail-copy" hidden={open !== title}><p>{copy}</p></div>
    </article>)}
  </section>;
}
