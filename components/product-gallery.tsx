'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/products';

export function ProductGallery({ product }: { product: Product }) {
  const [inspection, setInspection] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (inspection === null) return;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setInspection(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [inspection]);

  return <>
    <section className="product-gallery" aria-label={`${product.name} images`}>
      {product.images.map((image, index) => <figure key={image} className={index === 0 ? 'gallery-hero' : 'gallery-detail'}>
        <button type="button" className="gallery-open" onClick={() => setInspection(index)} aria-label={`Inspect ${product.name}, view ${index + 1}`}>
          <Image src={image} alt={`${product.name}, view ${index + 1}`} fill sizes="(max-width: 800px) 100vw, 66vw" priority={index === 0} />
        </button>
        <span>VIEW / {String(index + 1).padStart(2, '0')}</span>
      </figure>)}
    </section>
    <dialog className="image-inspector" open={inspection !== null} aria-labelledby="inspection-title" inert={inspection === null}>
      {inspection !== null && <><button ref={closeRef} className="inspector-close" type="button" onClick={() => setInspection(null)}>CLOSE <span aria-hidden="true">×</span></button><h2 id="inspection-title">{product.name} / VIEW {String(inspection + 1).padStart(2, '0')}</h2><div className="inspector-image"><Image src={product.images[inspection]} alt={`${product.name}, enlarged view ${inspection + 1}`} fill sizes="100vw" priority /></div></>}
    </dialog>
  </>;
}
