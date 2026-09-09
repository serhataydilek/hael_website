'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { DecodedText } from '@/components/decoded-text';
import { useStorefront } from '@/components/storefront-experience';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'home' }) {
  const { count, openCart } = useStorefront();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const previousY = useRef(0);
  const trigger = variant === 'home' ? 'hero' : 'immediate';

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
        <span className="hael-mark-crop" aria-hidden="true">
          <Image src="/hael-logo-reference.png" alt="" width={1600} height={1125} priority />
        </span>
        <DecodedText text="HAEL" trigger={trigger} duration={0.36} delay={0.04} hover accessible={false} decodeId={`nav-hael-${variant}`} />
      </Link>
      <nav aria-label="Primary navigation">
        {variant === 'home' && (
          <span className="home-secondary-nav">
            <Link href="/shop">
              <DecodedText text="Shop" trigger="inView" duration={0.32} hover accessible={false} decodeId="nav-shop" />
            </Link>
            <Link href="#collection">
              <DecodedText text="Collection" trigger="inView" duration={0.34} delay={0.04} hover accessible={false} decodeId="nav-collection" />
            </Link>
            <Link href="#lookbook">
              <DecodedText text="Lookbook" trigger="inView" duration={0.34} delay={0.08} hover accessible={false} decodeId="nav-lookbook" />
            </Link>
          </span>
        )}
        {variant === 'default' && (
          <Link href="/shop">
            <DecodedText text="Drop 001" trigger="immediate" duration={0.34} hover accessible={false} decodeId="nav-drop" />
          </Link>
        )}
        <button className="bag-trigger" onClick={openCart} type="button" aria-label={`Bag ${String(count).padStart(2, '0')}`}>
          <DecodedText text="Bag" trigger={trigger} duration={0.32} delay={0.1} hover accessible={false} decodeId={`nav-bag-${variant}`} />{' '}
          <span key={count} className="animated-count">
            [{String(count).padStart(2, '0')}]
          </span>
        </button>
      </nav>
    </header>
  );
}
