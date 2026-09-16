import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="cart-page page-shell">
      <p className="eyebrow">404 / MISSING OBJECT</p>
      <h1>Not found</h1>
      <p className="cart-empty">This object is not available in Drop 001.</p>
      <Link className="text-link" href="/shop">Enter collection <span aria-hidden="true">→</span></Link>
    </main>
  );
}
