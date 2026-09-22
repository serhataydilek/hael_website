'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStorefront } from '@/components/storefront-experience';
import { products } from '@/lib/products';

export function CartView() {
  const { lines, ready, updateCart } = useStorefront();
  const total = lines.reduce(
    (sum, line) =>
      sum +
      (products.find((item) => item.id === line.productId)?.price ?? 0) *
        line.quantity,
    0,
  );

  return (
    <section className="cart-page">
      <h1>Bag</h1>
      {!ready ? (
        <p className="cart-empty">Loading bag…</p>
      ) : lines.length === 0 ? (
        <div className="cart-empty">
          <p>Your bag is empty.</p>
          <Link href="/shop">Shop</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {lines.map((line) => {
              const product = products.find(
                (item) => item.id === line.productId,
              );
              if (!product) return null;
              return (
                <article
                  className="cart-line"
                  key={`${line.productId}-${line.size}`}
                >
                  <Link
                    className="cart-thumb"
                    href={`/product/${product.slug}`}
                    aria-label={`View ${product.name}`}
                  >
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="140px"
                      unoptimized
                    />
                  </Link>
                  <div>
                    <h2>{product.name}</h2>
                    <p>{line.size}</p>
                    <div className="qty">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name}`}
                        onClick={() =>
                          updateCart(
                            line.quantity === 1
                              ? lines.filter((item) => item !== line)
                              : lines.map((item) =>
                                  item === line
                                    ? { ...item, quantity: item.quantity - 1 }
                                    : item,
                                ),
                          )
                        }
                      >
                        −
                      </button>
                      <strong>{String(line.quantity).padStart(2, '0')}</strong>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name}`}
                        onClick={() =>
                          updateCart(
                            lines.map((item) =>
                              item === line
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-line"
                      type="button"
                      onClick={() =>
                        updateCart(lines.filter((item) => item !== line))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <p>€{product.price * line.quantity}</p>
                </article>
              );
            })}
          </div>
          <aside className="cart-summary">
            <div>
              <span>Subtotal</span>
              <strong>€{total}</strong>
            </div>
            <p>Taxes included. Delivery calculated in the next phase.</p>
            <button type="button" disabled>
              Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
