'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { OpeningScreen } from '@/components/opening-screen';
import { SiteHeader } from '@/components/site-header';
import { SiteMenu } from '@/components/site-menu';
import { useStorefront } from '@/components/storefront-experience';

export function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isCartOpen, isMenuOpen, closeCart, closeMenu, lines, updateCart } =
    useStorefront();

  return (
    <>
      <OpeningScreen pathname={pathname} />
      <SiteHeader />
      <div
        className="route-stage"
        inert={isCartOpen || isMenuOpen}
        key={pathname}
      >
        {children}
      </div>
      <SiteMenu open={isMenuOpen} onClose={closeMenu} />
      <CartDrawer
        lines={lines}
        open={isCartOpen}
        onClose={closeCart}
        updateCart={updateCart}
      />
    </>
  );
}
