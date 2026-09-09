'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { addCartLine, readCart, writeCart, type CartLine } from '@/lib/cart';
import { products, type Size } from '@/lib/products';

type StorefrontContextValue = {
  lines: CartLine[];
  ready: boolean;
  isCartOpen: boolean;
  count: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, size: Size) => void;
  updateCart: (lines: CartLine[]) => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefront() {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error('useStorefront must be used inside StorefrontExperience');
  return value;
}

function OpeningScreen({ pathname }: { pathname: string }) {
  const [phase, setPhase] = useState<'checking' | 'playing' | 'done'>('checking');

  useEffect(() => {
    const resolveOpening = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const shouldPlay = pathname === '/' && !sessionStorage.getItem('hael-opening-seen') && !reducedMotion;
      if (!shouldPlay) {
        sessionStorage.setItem('hael-opening-seen', 'true');
        setPhase('done');
        return;
      }
      sessionStorage.setItem('hael-opening-seen', 'true');
      setPhase('playing');
    };
    queueMicrotask(resolveOpening);
  }, [pathname]);

  if (pathname !== '/' || phase === 'done') return null;

  return (
    <div className="opening-screen" data-phase={phase} aria-hidden="true" onAnimationEnd={(event) => event.currentTarget === event.target && phase === 'playing' && setPhase('done')}>
      <div className="opening-mark"><strong>HAEL</strong><span>DROP / 001</span></div>
      <span className="opening-coordinate">IST / 41.0082° N</span>
    </div>
  );
}

function CartDrawer({ lines, open, onClose, updateCart }: { lines: CartLine[]; open: boolean; onClose: () => void; updateCart: (lines: CartLine[]) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + (products.find((product) => product.id === line.productId)?.price ?? 0) * line.quantity, 0);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <>
      <button className="cart-backdrop" data-open={open} onClick={onClose} disabled={!open} aria-hidden={!open} aria-label="Close bag" tabIndex={-1} />
      <dialog className="cart-drawer" open aria-hidden={!open} aria-modal={open || undefined} aria-labelledby="cart-drawer-title" inert={!open} onKeyDown={trapFocus}>
        <header className="drawer-header">
          <div><p>ACTIVE SELECTION</p><h2 id="cart-drawer-title">Bag <span key={count} className="animated-count">[{String(count).padStart(2, '0')}]</span></h2></div>
          <button ref={closeRef} onClick={onClose} type="button">CLOSE <span aria-hidden="true">×</span></button>
        </header>

        <div className="drawer-lines" aria-live="polite">
          {lines.length === 0 ? <div className="drawer-empty"><p>Your selection is empty.</p><Link href="/shop" onClick={onClose}>Enter collection →</Link></div> : lines.map((line, index) => {
            const product = products.find((item) => item.id === line.productId);
            if (!product) return null;
            const style = { '--line-index': index } as CSSProperties;
            return <article className="drawer-line" style={style} key={`${line.productId}-${line.size}`}>
              <Link className="drawer-thumb" href={`/product/${product.slug}`} onClick={onClose}><Image src={product.images[0]} alt="" fill sizes="104px" /></Link>
              <div className="drawer-line-main"><p>{product.name}</p><span>{product.id} / BLACK / {line.size}</span><div className="drawer-quantity"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => updateCart(line.quantity === 1 ? lines.filter((item) => item !== line) : lines.map((item) => item === line ? { ...item, quantity: item.quantity - 1 } : item))}>−</button><strong>{String(line.quantity).padStart(2, '0')}</strong><button aria-label={`Increase ${product.name} quantity`} onClick={() => updateCart(lines.map((item) => item === line ? { ...item, quantity: item.quantity + 1 } : item))}>+</button></div></div>
              <div className="drawer-line-end"><span>€{product.price * line.quantity}</span><button onClick={() => updateCart(lines.filter((item) => item !== line))}>Remove</button></div>
            </article>;
          })}
        </div>

        <footer className="drawer-footer">
          <div><span>SUBTOTAL</span><strong key={total} className="animated-subtotal">€{total}</strong></div>
          <p>Taxes included. Delivery calculated later.</p>
          <Link className="drawer-bag-link" href="/cart" onClick={onClose}>VIEW BAG <span aria-hidden="true">→</span></Link>
        </footer>
      </dialog>
    </>
  );
}

export function StorefrontExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const refresh = useCallback(() => setLines(readCart()), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCart = useCallback(() => setCartOpen(true), []);

  useEffect(() => {
    queueMicrotask(() => { refresh(); setReady(true); });
    window.addEventListener('hael-cart-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('hael-cart-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const updateCart = useCallback((next: CartLine[]) => {
    setLines(next);
    writeCart(next);
  }, []);

  const addItem = useCallback((productId: string, size: Size) => {
    const next = addCartLine(productId, size);
    setLines(next);
    setCartOpen(true);
  }, []);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const value = { lines, ready, isCartOpen, count, openCart, closeCart, addItem, updateCart };

  return (
    <StorefrontContext.Provider value={value}>
      <OpeningScreen pathname={pathname} />
      <div className="route-stage" key={pathname}>{children}</div>
      <CartDrawer lines={lines} open={isCartOpen} onClose={closeCart} updateCart={updateCart} />
    </StorefrontContext.Provider>
  );
}
