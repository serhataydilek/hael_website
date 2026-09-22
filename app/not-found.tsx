import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';

export default function NotFound() {
  return (
    <main>
      <section className="miss">
        <h1>Not found</h1>
        <p>This page is not in the store.</p>
        <Link href="/shop">Shop</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
