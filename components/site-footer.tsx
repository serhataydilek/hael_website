import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FooterNewsletter } from '@/components/footer-newsletter';
import {
  HAEL_CONTACT_HREF,
  HAEL_INSTAGRAM_HREF,
  HAEL_SHIPPING_HREF,
} from '@/lib/site-footer';

function FooterPlaceholderLink({ children }: { children: ReactNode }) {
  return (
    <a
      aria-disabled="true"
      className="footer-placeholder-link"
      href="#footer-destination"
      tabIndex={0}
      title="Destination coming soon"
    >
      {children}
    </a>
  );
}

function FooterNav() {
  return (
    <nav className="footer-nav" aria-label="Footer">
      <Link href="/shop">Shop</Link>
      {HAEL_INSTAGRAM_HREF ? (
        <a href={HAEL_INSTAGRAM_HREF} rel="noreferrer noopener" target="_blank">
          Instagram
        </a>
      ) : (
        <FooterPlaceholderLink>Instagram</FooterPlaceholderLink>
      )}
      <a href={HAEL_CONTACT_HREF}>Contact</a>
      {HAEL_SHIPPING_HREF ? (
        <a href={HAEL_SHIPPING_HREF}>Shipping</a>
      ) : (
        <FooterPlaceholderLink>Shipping</FooterPlaceholderLink>
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-frame">
        <div className="footer-top">
          <div className="footer-col footer-col-left">
            <p className="footer-legal">
              © 2026 HAEL
              <br />
              All rights reserved.
            </p>
            <p className="footer-mantra">
              Clothing
              <br />
              Objects
              <br />A state of mind.
            </p>
          </div>
          <div className="footer-kicker-stack">
            <p className="footer-kicker">
              <Image
                src="/dont-blame-us.png"
                alt="Don't blame us."
                width={2360}
                height={1640}
                unoptimized
              />
            </p>
            <FooterNewsletter />
          </div>
          <FooterNav />
          <div className="footer-col footer-col-right">
            <div className="footer-mark-cluster">
              <p className="footer-mark-meta">
                <span>HAEL</span>
                <span>ISTANBUL, 2026</span>
              </p>
              <span className="footer-mark-separator" aria-hidden="true" />
              <Link
                className="footer-mark-link"
                href="/"
                aria-label="HAEL home"
              >
                <Image
                  src="/brand/hael-footer-mark-soft.png"
                  alt=""
                  width={720}
                  height={720}
                  unoptimized
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-atmosphere" aria-hidden="true">
          <Image
            src="/brand/manifesto-silhouette.png"
            alt=""
            width={600}
            height={600}
            unoptimized
          />
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <div className="footer-monolith-wordmark">
            <Image
              src="/brand/hael-monolith-wordmark-soft.png"
              alt="HAEL"
              width={2078}
              height={468}
              unoptimized
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
