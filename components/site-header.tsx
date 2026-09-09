'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useStorefront } from '@/components/storefront-experience';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'home' }) {
  const { count, openCart } = useStorefront();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const previousY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY.current;
      setScrolled(currentY > 12);
      if (variant === 'home') setHidden(false);
      else if (currentY < 90) setHidden(false);
      else if (Math.abs(delta) > 8) setHidden(delta > 0);
      previousY.current = currentY;
    };
    previousY.current = window.scrollY;
    const initialFrame = window.requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [variant]);

  return (
    <header className="site-header" data-variant={variant} data-scrolled={scrolled} data-hidden={hidden}>
      <Link className="wordmark brand-lockup" href="/" aria-label="HAEL home">
        <span className="hael-mark-crop" aria-hidden="true"><Image src="/hael-logo-reference.png" alt="" width={1600} height={1125} priority /></span>
        <span>HAEL</span>
      </Link>
      <nav aria-label="Primary navigation">
        {variant === 'home' && <span className="home-secondary-nav"><Link href="/shop">Shop</Link><Link href="#collection">Collection</Link><Link href="#lookbook">Lookbook</Link></span>}
        {variant === 'default' && <Link href="/shop">Drop 001</Link>}
        <button className="bag-trigger" onClick={openCart} type="button">Bag <span key={count} className="animated-count">[{String(count).padStart(2, '0')}]</span></button>
      </nav>
    </header>
  );
}
