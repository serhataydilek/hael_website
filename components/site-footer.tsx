/**
 * HAEL site footer.
 * Default variant is "monolith".
 * Switch globally: change DEFAULT_SITE_FOOTER_VARIANT in lib/site-footer.ts
 * Switch per page: <SiteFooter variant="afterimage" />
 */
import Image from 'next/image';
import Link from 'next/link';
import {
  DEFAULT_SITE_FOOTER_VARIANT,
  HAEL_CONTACT_HREF,
  HAEL_INSTAGRAM_HREF,
  type SiteFooterVariant,
} from '@/lib/site-footer';

export type { SiteFooterVariant };
export { DEFAULT_SITE_FOOTER_VARIANT };

function HaelMark() {
  return (
    <span className="hael-mark-crop footer-hael-mark" aria-hidden="true">
      <Image src="/hael-logo-reference.png" alt="" width={1600} height={1125} />
    </span>
  );
}

function FooterNav({ layout }: { layout: 'row' | 'stack' }) {
  return (
    <nav className={`footer-nav footer-nav--${layout}`} aria-label="Footer">
      <Link href="/shop">SHOP</Link>
      {HAEL_INSTAGRAM_HREF ? (
        <a href={HAEL_INSTAGRAM_HREF} rel="noreferrer noopener" target="_blank">
          INSTAGRAM
        </a>
      ) : (
        <span>INSTAGRAM</span>
      )}
      <a href={HAEL_CONTACT_HREF} aria-label="Email HAEL">CONTACT</a>
      <span>SHIPPING</span>
    </nav>
  );
}

function MonolithFooter() {
  return (
    <div className="footer-frame">
      <div className="footer-monolith-top">
        <div className="footer-monolith-left">
          <p className="footer-kicker">DON&apos;T BLAME US.</p>
          <FooterNav layout="row" />
        </div>
        <div className="footer-monolith-end">
          <div className="footer-monolith-meta">
            <span>HAEL</span>
            <span>DROP 001</span>
            <span>ISTANBUL, 2026</span>
          </div>
          <Link className="footer-mark-link" href="/" aria-label="HAEL home">
            <HaelMark />
          </Link>
        </div>
      </div>
      <div className="footer-monolith-stage">
        <p className="footer-monolith-word" aria-label="HAEL">
          <span aria-hidden="true">HAEL</span>
        </p>
        <div className="footer-monolith-aside">
          <p>
            © 2026 HAEL
            <br />
            ALL RIGHTS RESERVED.
          </p>
          <hr className="footer-aside-rule" />
          <p className="footer-mantra footer-mantra--stack">
            CLOTHING
            <br />
            OBJECTS
            <br />
            A STATE OF MIND.
          </p>
        </div>
      </div>
    </div>
  );
}

function AfterimageFooter() {
  return (
    <>
      <div className="footer-afterimage-bg" aria-hidden="true">
        <Image
          src="/footer/afterimage.webp"
          alt=""
          fill
          sizes="(max-width: 800px) 70vw, 42vw"
          unoptimized
        />
      </div>
      <div className="footer-afterimage-grid">
        <div className="footer-afterimage-left">
          <p className="footer-afterimage-title">DON&apos;T BLAME US.</p>
          <p className="footer-meta">
            HAEL / DROP 001
            <br />
            ISTANBUL, 2026
          </p>
          <hr className="footer-aside-rule" />
          <FooterNav layout="stack" />
        </div>
        <div className="footer-afterimage-right">
          <p className="footer-mantra footer-mantra--stack">
            CLOTHING
            <br />
            OBJECTS
            <br />
            A STATE OF MIND.
          </p>
          <Link className="footer-mark-link" href="/" aria-label="HAEL home">
            <HaelMark />
          </Link>
        </div>
        <div className="footer-afterimage-bottom">
          <p>
            © 2026 HAEL
            <br />
            ALL RIGHTS RESERVED.
          </p>
          <hr className="footer-afterimage-rule" />
        </div>
      </div>
    </>
  );
}

export function SiteFooter({
  variant = DEFAULT_SITE_FOOTER_VARIANT,
}: {
  variant?: SiteFooterVariant;
}) {
  return (
    <footer className="site-footer" data-variant={variant}>
      {variant === 'afterimage' ? <div className="footer-grain" aria-hidden="true" /> : null}
      {variant === 'afterimage' ? (
        <div className="footer-inner page-shell">
          <AfterimageFooter />
        </div>
      ) : (
        <MonolithFooter />
      )}
    </footer>
  );
}
