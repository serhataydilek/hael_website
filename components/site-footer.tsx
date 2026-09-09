import Link from 'next/link';
import { DecodedText } from '@/components/decoded-text';

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <div>
        <DecodedText className="wordmark" text="HAEL" trigger="inView" duration={0.36} hover decodeId="footer-hael" />
        <p>
          Altered garment studies.
          <br />
          Istanbul / 41.0082° N
        </p>
      </div>
      <div>
        <DecodedText as="p" className="footer-label" text="INDEX" trigger="inView" duration={0.3} decodeId="footer-index" />
        <Link href="/">Journal</Link>
        <Link href="/shop">
          <DecodedText text="Collection" trigger="inView" duration={0.3} hover accessible={false} decodeId="footer-collection" />
        </Link>
        <Link href="/cart">
          <DecodedText text="Bag" trigger="inView" duration={0.28} hover accessible={false} decodeId="footer-bag" />
        </Link>
      </div>
      <div>
        <DecodedText as="p" className="footer-label" text="INFORMATION" trigger="inView" duration={0.32} delay={0.04} decodeId="footer-info" />
        <span>Materials</span>
        <span>Care</span>
        <span>Delivery</span>
      </div>
      <p className="footer-mark">
        © 2026 / HAEL
        <br />
        ALL FORMS RESERVED
      </p>
    </footer>
  );
}
