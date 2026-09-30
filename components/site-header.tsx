'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStorefront } from '@/components/storefront-experience';

export function SiteHeader() {
  const { count, openCart } = useStorefront();

  return (
    <header className="site-header">
      <span className="header-spacer" aria-hidden="true" />
      <Link className="brand-lockup" href="/" aria-label="HAEL home">
        <span className="hael-mark" aria-hidden="true">
          <Image
            src="/brand/hael-primary.png"
            alt=""
            width={624}
            height={719}
            priority
            unoptimized
          />
        </span>
      </Link>
      <button
        className="shell-control bag-trigger"
        type="button"
        onClick={openCart}
        aria-label={`Bag ${count}`}
      >
        Bag ({count})
      </button>
    </header>
  );
}
