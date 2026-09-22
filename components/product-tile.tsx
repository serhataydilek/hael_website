import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';

export function ProductTile({
  product,
  className,
  sizes = '(max-width: 800px) 48vw, 24vw',
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const alternate = product.images[1];

  return (
    <article className={className ? `tile ${className}` : 'tile'}>
      <Link className="tile-link" href={`/product/${product.slug}`}>
        <div className="tile-frame">
          <div className="tile-photo">
            <Image
              className="tile-primary"
              src={product.images[0]}
              alt={`${product.name} front view`}
              fill
              sizes={sizes}
              unoptimized
            />
            {alternate ? (
              <Image
                className="tile-alt"
                src={alternate}
                alt=""
                fill
                sizes={sizes}
                unoptimized
              />
            ) : null}
          </div>
        </div>
        <div className="tile-meta">
          <span>{product.name}</span>
          <span>€{product.price}</span>
        </div>
      </Link>
    </article>
  );
}
