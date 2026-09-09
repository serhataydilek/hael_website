import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <div><span className="wordmark">HAEL</span><p>Altered garment studies.<br />Istanbul / 41.0082° N</p></div>
      <div><p className="footer-label">INDEX</p><Link href="/">Journal</Link><Link href="/shop">Collection</Link><Link href="/cart">Bag</Link></div>
      <div><p className="footer-label">INFORMATION</p><span>Materials</span><span>Care</span><span>Delivery</span></div>
      <p className="footer-mark">© 2026 / HAEL<br />ALL FORMS RESERVED</p>
    </footer>
  );
}
