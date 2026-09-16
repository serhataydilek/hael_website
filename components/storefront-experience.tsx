'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DecodedText } from '@/components/decoded-text';
import { addCartLine, readCart, writeCart, type CartLine } from '@/lib/cart';
import { products, type Size } from '@/lib/products';
import { decideLoaderMode } from '@/lib/loader-session';
import { markLoaderSettled } from '@/lib/text-decode';
import { clearStrokeHandoff, consumeStrokeHandoff } from '@/lib/stroke-handoff';

const LOADER_FRAMES = [
  '/animations/hael-loader/frame-00.webp',
  '/animations/hael-loader/frame-01.webp',
  '/animations/hael-loader/frame-02.webp',
  '/animations/hael-loader/frame-03.webp',
  '/animations/hael-loader/frame-04.webp',
  '/animations/hael-loader/frame-05.webp',
  '/animations/hael-loader/frame-06.webp',
] as const;
const FRAME_DURATION = 120;
const FRAME_COUNT = LOADER_FRAMES.length;
const FRAME_LAST = FRAME_COUNT - 1;
const TOTAL_DURATION = FRAME_DURATION * FRAME_COUNT;
const FADE_START = 720;

let loaderPlayedThisDocument = false;

function preloadLoaderFrames() {
  return Promise.all(
    LOADER_FRAMES.map((src) => {
      const image = new window.Image();
      image.src = src;
      if (image.decode) return image.decode();
      return new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(src));
      });
    }),
  );
}

function lockLoaderScroll() {
  const root = document.documentElement;
  root.dataset.haelLoaderMode = 'play';
  root.dataset.haelLoaderActive = 'true';
  root.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockLoaderScroll() {
  const root = document.documentElement;
  root.removeAttribute('data-hael-loader-active');
  root.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
}

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
  const [gone, setGone] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [clockReady, setClockReady] = useState(false);
  const resolved = useRef(false);
  const entryPathname = useRef(pathname);
  const finished = useRef(false);
  const rafRef = useRef(0);
  const startedAt = useRef(0);
  const frameIndexRef = useRef(0);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    loaderPlayedThisDocument = true;
    document.documentElement.dataset.haelLoaderMode = 'skip';
    unlockLoaderScroll();
    markLoaderSettled();
    setGone(true);
  }, []);

  useLayoutEffect(() => {
    if (finished.current) return;
    if (resolved.current) {
      if (pathname !== entryPathname.current) finish();
      return;
    }
    resolved.current = true;

    if (loaderPlayedThisDocument || decideLoaderMode() === 'skip') {
      finish();
      return;
    }

    lockLoaderScroll();

    let cancelled = false;
    void preloadLoaderFrames()
      .then(() => {
        if (cancelled || finished.current) return;
        startedAt.current = performance.now();
        frameIndexRef.current = 0;
        setFrameIndex(0);
        setOpacity(1);
        setClockReady(true);
      })
      .catch(() => {
        if (!cancelled) finish();
      });

    return () => {
      cancelled = true;
    };
  }, [finish, pathname]);

  useEffect(() => {
    if (!clockReady) return;

    const tick = (now: number) => {
      if (finished.current) return;
      const elapsed = now - startedAt.current;
      const nextFrame = Math.min(Math.floor(elapsed / FRAME_DURATION), FRAME_LAST);
      if (nextFrame !== frameIndexRef.current) {
        frameIndexRef.current = nextFrame;
        setFrameIndex(nextFrame);
      }
      setOpacity(elapsed < FADE_START ? 1 : Math.max(0, 1 - (elapsed - FADE_START) / FRAME_DURATION));
      if (elapsed >= TOTAL_DURATION) {
        finish();
        return;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [clockReady, finish]);

  useEffect(() => () => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    unlockLoaderScroll();
  }, []);

  if (gone) return null;

  return (
    <div className="opening-screen" aria-hidden="true" style={{ opacity }}>
      <Image
        className="opening-art"
        src={LOADER_FRAMES[frameIndex]}
        alt=""
        width={651}
        height={1560}
        priority
        unoptimized
        draggable={false}
      />
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
          <div>
            <DecodedText as="p" text="ACTIVE SELECTION" trigger="open" active={open} duration={0.32} decodeId="drawer-active" />
            <h2 id="cart-drawer-title">
              <DecodedText text="Bag" trigger="open" active={open} duration={0.36} delay={0.04} decodeId="drawer-bag" />{' '}
              <span key={count} className="animated-count">[{String(count).padStart(2, '0')}]</span>
            </h2>
          </div>
          <button ref={closeRef} onClick={onClose} type="button">CLOSE <span aria-hidden="true">×</span></button>
        </header>

        <div className="drawer-lines" aria-live="polite">
          {lines.length === 0 ? <div className="drawer-empty"><DecodedText as="p" text="Your selection is empty." trigger="open" active={open} duration={0.4} decodeId="drawer-empty" /><Link href="/shop" onClick={onClose} aria-label="Enter collection"><DecodedText text="Enter collection →" trigger="open" active={open} duration={0.34} delay={0.06} hover accessible={false} decodeId="drawer-enter" /></Link></div> : lines.map((line, index) => {
            const product = products.find((item) => item.id === line.productId);
            if (!product) return null;
            const style = { '--line-index': index } as CSSProperties;
            return <article className="drawer-line" style={style} key={`${line.productId}-${line.size}`}>
              <Link className="drawer-thumb" href={`/product/${product.slug}`} onClick={onClose} aria-label={`View ${product.id}`}><Image src={product.images[0]} alt="" fill sizes="104px" unoptimized style={{ objectFit: 'contain', objectPosition: 'center' }} /></Link>
              <div className="drawer-line-main"><p>{product.name}</p><span>{product.id} / BLACK / {line.size}</span><div className="drawer-quantity"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => updateCart(line.quantity === 1 ? lines.filter((item) => item !== line) : lines.map((item) => item === line ? { ...item, quantity: item.quantity - 1 } : item))}>−</button><strong>{String(line.quantity).padStart(2, '0')}</strong><button aria-label={`Increase ${product.name} quantity`} onClick={() => updateCart(lines.map((item) => item === line ? { ...item, quantity: item.quantity + 1 } : item))}>+</button></div></div>
              <div className="drawer-line-end"><span>€{product.price * line.quantity}</span><button onClick={() => updateCart(lines.filter((item) => item !== line))}>Remove</button></div>
            </article>;
          })}
        </div>

        <footer className="drawer-footer">
          <div><DecodedText text="SUBTOTAL" trigger="open" active={open} duration={0.3} decodeId="drawer-subtotal" /><strong key={total} className="animated-subtotal">€{total}</strong></div>
          <p>Taxes included. Delivery calculated later.</p>
          <Link className="drawer-bag-link" href="/cart" onClick={onClose} aria-label="View bag">
            <DecodedText text="VIEW BAG" trigger="open" active={open} duration={0.34} hover accessible={false} decodeId="drawer-view" /> <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </dialog>
    </>
  );
}

export function StorefrontExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [handoff, setHandoff] = useState(false);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const refresh = useCallback(() => setLines(readCart()), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCart = useCallback(() => setCartOpen(true), []);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readCart();
      writeCart(stored);
      setLines(stored);
      setReady(true);
    });
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

  useLayoutEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setHandoff(consumeStrokeHandoff());
    });
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    if (!handoff) return;
    const timer = window.setTimeout(() => clearStrokeHandoff(), 400);
    return () => window.clearTimeout(timer);
  }, [handoff]);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const value = { lines, ready, isCartOpen, count, openCart, closeCart, addItem, updateCart };

  return (
    <StorefrontContext.Provider value={value}>
      <OpeningScreen pathname={pathname} />
      <div className="route-stage" data-handoff={handoff ? 'true' : undefined} inert={isCartOpen} key={pathname}>{children}</div>
      <CartDrawer lines={lines} open={isCartOpen} onClose={closeCart} updateCart={updateCart} />
    </StorefrontContext.Provider>
  );
}
