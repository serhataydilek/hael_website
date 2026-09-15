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
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const previousY = useRef(0);
  const trigger = variant === 'home' ? 'hero' : 'immediate';

  useLayoutEffect(() => {
    if (variant !== 'home') return;
    const applyReveal = () => {
      if (revealedRef.current || !isHeroRevealed()) return;
      revealedRef.current = true;
      previousY.current = window.scrollY;
      setHidden(false);
      setRevealed(true);
    };
    applyReveal();
    window.addEventListener('hael-hero-revealed', applyReveal);
    return () => window.removeEventListener('hael-hero-revealed', applyReveal);
  }, [variant]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY.current;
      setScrolled(currentY > 12);
      if (variant === 'home' && !revealedRef.current) setHidden(false);
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
    <header className="site-header" data-variant={variant} data-scrolled={scrolled} data-hidden={hidden} data-revealed={revealed}>
      <Link className="wordmark brand-lockup" href="/" aria-label="HAEL home">
        <span className="hael-mark-crop" aria-hidden="true">
          <Image src="/hael-logo-reference.png" alt="" width={1600} height={1125} priority />
        </span>
        <DecodedText text="HAEL" trigger={trigger} duration={0.36} delay={0.04} hover accessible={false} decodeId={`nav-hael-${variant}`} />
      </Link>
      <nav aria-label="Primary navigation">
        {variant === 'home' && (
          <span className="home-secondary-nav">
            <Link href="/shop" aria-label="Shop">
              <DecodedText text="Shop" trigger="inView" duration={0.32} hover accessible={false} decodeId="nav-shop" />
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
