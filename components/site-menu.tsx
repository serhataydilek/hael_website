'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { HAEL_CONTACT_HREF } from '@/lib/site-footer';

export function SiteMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const prior = useRef<HTMLElement | null>(null);

  const go = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClose();
    router.push(href);
  };

  useEffect(() => {
    if (!open) return;
    prior.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prior.current?.focus();
    };
  }, [onClose, open]);

  const trap = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        className="menu-backdrop"
        data-open={open}
        onClick={onClose}
        disabled={!open}
        aria-hidden={!open}
        aria-label="Close menu"
        tabIndex={-1}
      />
      <dialog
        className="site-menu"
        id="site-menu"
        open
        aria-hidden={!open}
        aria-modal={open || undefined}
        aria-label="Menu"
        inert={!open}
        onKeyDown={trap}
      >
        <div className="menu-top">
          <button ref={closeRef} type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <nav className="menu-links">
          <Link href="/" onClick={go('/')}>
            Home
          </Link>
          <Link href="/shop" onClick={go('/shop')}>
            Shop
          </Link>
          <a href={HAEL_CONTACT_HREF}>Contact</a>
        </nav>
        <p className="menu-foot">© 2026 HAEL</p>
      </dialog>
    </>
  );
}
