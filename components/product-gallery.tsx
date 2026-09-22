import Image from 'next/image';
import type { Product } from '@/lib/products';

export function ProductGallery({ product }: { product: Product }) {
  return (
    <section className="pdp-gallery" aria-label={`${product.name} images`}>
      {product.images.map((source, index) => (
        <figure key={source}>
          <div className="tile-photo">
            <Image
              src={source}
              alt={`${product.name}, view ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 860px) 100vw, 40vw"
              unoptimized
            />
          </div>
        </figure>
      ))}
    </section>
  );
}
