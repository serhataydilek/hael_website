import { CampaignHero } from '@/components/campaign-hero';
import { FieldNotes } from '@/components/field-notes';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <main className="home-main">
      <SiteHeader variant="home" />
      <CampaignHero />
      <FieldNotes />
      <SiteFooter />
    </main>
  );
}
