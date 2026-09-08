'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const items = JSON.parse(localStorage.getItem('peyam-cart') ?? '[]') as Array<{ quantity?: number }>;
        setCount(items.reduce((total, item) => total + (item.quantity ?? 0), 0));
      } catch { setCount(0); }
    };
    update();
    window.addEventListener('peyam-cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('peyam-cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="PEYAM home">PEYAM</Link>
      <nav aria-label="Primary navigation"><Link href="/shop">Collection 001</Link><Link href="/cart">Bag [{String(count).padStart(2, '0')}]</Link></nav>
    </header>
  );
}
