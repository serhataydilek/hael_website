'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { addCartLine, readCart, writeCart, type CartLine } from '@/lib/cart';
import type { Size } from '@/lib/products';

type StorefrontContextValue = {
  lines: CartLine[];
  ready: boolean;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  count: number;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  addItem: (productId: string, size: Size) => void;
  updateCart: (lines: CartLine[]) => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefront() {
  const value = useContext(StorefrontContext);
  if (!value)
    throw new Error('useStorefront must be used inside StorefrontExperience');
  return value;
}

export function StorefrontExperience({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const refresh = useCallback(() => setLines(readCart()), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openCart = useCallback(() => {
    setMenuOpen(false);
    setCartOpen(true);
  }, []);
  const openMenu = useCallback(() => {
    setCartOpen(false);
    setMenuOpen(true);
  }, []);

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
    setMenuOpen(false);
    setCartOpen(true);
  }, []);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <StorefrontContext.Provider
      value={{
        lines,
        ready,
        isCartOpen,
        isMenuOpen,
        count,
        openCart,
        closeCart,
        openMenu,
        closeMenu,
        addItem,
        updateCart,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}
