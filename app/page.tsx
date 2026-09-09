import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <main>
      <SiteHeader variant="home" />
      <section className="campaign-hero" aria-labelledby="campaign-title">
        <h1 id="campaign-title" className="campaign-phrase" aria-label="dont blame us">
          <span className="campaign-phrase-word campaign-phrase-dont">dont</span>
          <span className="campaign-phrase-blame" aria-hidden="true">
            <Image src="/blame-handwritten.png" alt="" width={1434} height={2334} priority />
          </span>
          <span className="campaign-phrase-word campaign-phrase-us">us</span>
        </h1>
        <figure className="campaign-image">
          <Image src="/hael-campaign-01.png" alt="Model wearing HAEL's black graphic long-sleeve top in a dark studio" fill priority sizes="100vw" />
        </figure>
        <p className="campaign-control campaign-collection">Collection / 001</p>
        <Link className="campaign-control campaign-enter campaign-shop-now" href="/shop">Shop now <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="manifesto page-shell" aria-label="HAEL field notes">
        <p className="eyebrow">HAEL / FIELD NOTES</p>
        <p>Built from abrasion, repetition, and the trace a body leaves behind. The graphic is not decoration. It is the evidence.</p>
        <Link className="text-link" href="/shop">View the complete drop <span aria-hidden="true">→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
