'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { products } from '@/lib/products';
import type { CartLine } from '@/lib/cart';

export function CartDrawer({
  lines,
  open,
  onClose,
  updateCart,
}: {
  lines: CartLine[];
  open: boolean;
  onClose: () => void;
  updateCart: (lines: CartLine[]) => void;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const prior = useRef<HTMLElement | null>(null);

  const go = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClose();
    router.push(href);
  };
  const total = lines.reduce(
    (sum, line) =>
      sum +
      (products.find((item) => item.id === line.productId)?.price ?? 0) *
        line.quantity,
    0,
  );

  useEffect(() => {
    if (!open) return;
    prior.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prior.current?.focus();
    };
  }, [onClose, open]);

  const trap = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        className="cart-backdrop"
        data-open={open}
        onClick={onClose}
        disabled={!open}
        aria-hidden={!open}
        aria-label="Close bag"
        tabIndex={-1}
      />
      <dialog
        className="cart-drawer"
        open
        aria-hidden={!open}
        aria-modal={open || undefined}
        aria-labelledby="cart-drawer-title"
        inert={!open}
        onKeyDown={trap}
      >
        <header className="drawer-head">
          <h2 id="cart-drawer-title">Bag</h2>
          <button ref={closeRef} type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="drawer-lines" aria-live="polite">
          {lines.length === 0 ? (
            <div className="drawer-empty">
              <p>Your bag is empty.</p>
              <Link href="/shop" onClick={go('/shop')}>
                Shop
              </Link>
            </div>
          ) : (
            lines.map((line) => {
              const product = products.find(
                (item) => item.id === line.productId,
              );
              if (!product) return null;
              return (
                <article
                  className="drawer-line"
                  key={`${line.productId}-${line.size}`}
                >
                  <Link
                    className="drawer-thumb"
                    href={`/product/${product.slug}`}
                    onClick={go(`/product/${product.slug}`)}
                    aria-label={`View ${product.name}`}
                  >
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="88px"
                      unoptimized
                    />
                  </Link>
                  <div>
                    <p>{product.name}</p>
                    <span>{line.size}</span>
                    <div className="drawer-qty">
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
                  </div>
                  <div className="drawer-line-end">
                    <span>€{product.price * line.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCart(lines.filter((item) => item !== line))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <footer className="drawer-foot">
          <div>
            <span>Subtotal</span>
            <strong>€{total}</strong>
          </div>
          <p>Taxes included. Delivery calculated later.</p>
          <div className="drawer-actions">
            <Link href="/cart" onClick={go('/cart')}>
              View bag
            </Link>
            <button type="button" disabled title="Checkout coming soon">
              Checkout coming soon
            </button>
          </div>
        </footer>
      </dialog>
    </>
  );
}
