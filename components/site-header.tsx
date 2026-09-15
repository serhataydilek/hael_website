'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DecodedText } from '@/components/decoded-text';
import { useStorefront } from '@/components/storefront-experience';
import { isHeroRevealed } from '@/lib/hero-reveal';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'home' }) {
  const { count, openCart } = useStorefront();
  const [scrolled, setScrolled] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const trigger = variant === 'home' ? 'hero' : 'immediate';

  useLayoutEffect(() => {
    if (variant !== 'home') return;
    const applyReveal = () => {
      if (revealedRef.current || !isHeroRevealed()) return;
      revealedRef.current = true;
      setRevealed(true);
    };
    applyReveal();
    window.addEventListener('hael-hero-revealed', applyReveal);
    return () => window.removeEventListener('hael-hero-revealed', applyReveal);
  }, [variant]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    const initialFrame = window.requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className="site-header" data-variant={variant} data-scrolled={scrolled} data-revealed={revealed}>
      <Link className="wordmark brand-lockup" href="/" aria-label="HAEL home">
        <span className="hael-mark-crop" aria-hidden="true">
          <Image src="/brand/hael-footer-mark-soft.png" alt="" width={720} height={720} priority unoptimized />
        </span>
        <DecodedText text="HAEL" trigger={trigger} duration={0.36} delay={0.04} hover accessible={false} decodeId={`nav-hael-${variant}`} />
      </Link>
      <nav aria-label="Primary navigation">
        {variant === 'home' && (
          <span className="home-secondary-nav">
            <Link href="/shop" aria-label="Shop">
              <DecodedText text="Shop" trigger="immediate" duration={0.32} hover accessible={false} decodeId="nav-shop" />
            </Link>
          </span>
        )}
        {variant === 'default' && (
          <Link href="/shop" aria-label="Drop 001">
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
