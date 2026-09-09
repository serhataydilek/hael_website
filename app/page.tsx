import Link from 'next/link';
import { CampaignHero } from '@/components/campaign-hero';
import { DecodedText } from '@/components/decoded-text';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { DECODE_DURATION } from '@/lib/text-decode';

export default function Home() {
  return (
    <main className="home-main">
      <SiteHeader variant="home" />
      <CampaignHero />

      <section className="manifesto page-shell" aria-label="HAEL field notes">
        <DecodedText className="eyebrow" as="p" text="HAEL / FIELD NOTES" trigger="inView" duration={DECODE_DURATION.label} decodeId="home-field-notes" />
        <DecodedText
          className="manifesto-copy"
          as="p"
          text="Built from abrasion, repetition, and the trace a body leaves behind. The graphic is not decoration. It is the evidence."
          trigger="inView"
          duration={DECODE_DURATION.body}
          delay={0.08}
          decodeId="home-manifesto"
        />
        <Link className="text-link" href="/shop">
          <DecodedText text="View the complete drop →" trigger="inView" duration={DECODE_DURATION.cta} delay={0.14} hover decodeId="home-drop" />
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
