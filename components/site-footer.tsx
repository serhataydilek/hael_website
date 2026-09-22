import Image from 'next/image';
import Link from 'next/link';
import { HAEL_CONTACT_HREF, HAEL_INSTAGRAM_HREF } from '@/lib/site-footer';

function FooterNav() {
  return (
    <nav className="footer-nav" aria-label="Footer">
      <Link href="/shop">Shop</Link>
      {HAEL_INSTAGRAM_HREF ? (
        <a href={HAEL_INSTAGRAM_HREF} rel="noreferrer noopener" target="_blank">
          Instagram
        </a>
      ) : (
        <span>Instagram</span>
      )}
      <a href={HAEL_CONTACT_HREF}>Contact</a>
      <span>Shipping</span>
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
          <p className="footer-kicker">
            <Image
              src="/dont-blame-us.png"
              alt="Don't blame us."
              width={2360}
              height={1640}
              unoptimized
            />
          </p>
          <FooterNav />
          <div className="footer-col footer-col-right">
            <p className="footer-meta">
              <span>HAEL</span>
              <span>Drop 001</span>
              <span>Istanbul, 2026</span>
            </p>
            <Link className="footer-mark-link" href="/" aria-label="HAEL home">
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
