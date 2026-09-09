'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CampaignMark } from '@/components/campaign-mark';
import { DecodedText } from '@/components/decoded-text';
import { useTextDecode } from '@/lib/use-text-decode';
import { DECODE_DURATION, hasFinePointer, prefersReducedMotion, seedGibberish, whenHeroAvailable } from '@/lib/text-decode';

gsap.registerPlugin(useGSAP);

export const CampaignHero = memo(function CampaignHero() {
  const rootRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dontRef = useRef<HTMLSpanElement>(null);
  const dontLiveRef = useRef<HTMLSpanElement>(null);
  const blameRef = useRef<HTMLSpanElement>(null);
  const blameCodeRef = useRef<HTMLSpanElement>(null);
  const blameMarkRef = useRef<HTMLSpanElement>(null);
  const usRef = useRef<HTMLSpanElement>(null);
  const usLiveRef = useRef<HTMLSpanElement>(null);
  const playDont = useTextDecode(dontLiveRef, 'dont', 0.2, 0);
  const playBlame = useTextDecode(blameCodeRef, 'BLAME', 0.22, 0);
  const playUs = useTextDecode(usLiveRef, 'us', 0.24, 0);

  useGSAP(
    () => {
      const root = rootRef.current;
      const mark = markRef.current;
      const dont = dontRef.current;
      const dontLive = dontLiveRef.current;
      const blame = blameRef.current;
      const blameCode = blameCodeRef.current;
      const blameMark = blameMarkRef.current;
      const us = usRef.current;
      const usLive = usLiveRef.current;
      if (!root || !mark || !dont || !dontLive || !blame || !blameCode || !blameMark || !us || !usLive) return;

      const shown = { dont: false, blame: false, us: false };

      const showDont = () => {
        if (shown.dont) return;
        shown.dont = true;
        playDont({ duration: 0.2 });
        gsap.fromTo(dont, { autoAlpha: 0, x: -4 }, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
      };

      const showBlame = () => {
        if (shown.blame) return;
        shown.blame = true;
        gsap.set(blameCode, { autoAlpha: 1 });
        gsap.set(blameMark, { autoAlpha: 0 });
        playBlame({ duration: 0.22 });
        gsap.fromTo(blame, { autoAlpha: 0, y: -3 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(blameCode, { autoAlpha: 0, duration: 0.12, delay: 0.18, ease: 'power1.out' });
        gsap.to(blameMark, { autoAlpha: 1, duration: 0.16, delay: 0.18, ease: 'power2.out' });
      };

      const showUs = () => {
        if (shown.us) return;
        shown.us = true;
        playUs({ duration: 0.24 });
        gsap.fromTo(us, { autoAlpha: 0, x: 4 }, { autoAlpha: 1, x: 0, duration: 0.24, ease: 'power2.out', overwrite: 'auto' });
      };

      const syncFound = () => {
        if (root.dataset.foundDont === 'true') showDont();
        if (root.dataset.foundBlame === 'true') showBlame();
        if (root.dataset.foundUs === 'true') showUs();
      };

      if (prefersReducedMotion() || !hasFinePointer()) {
        dontLive.textContent = 'dont';
        usLive.textContent = 'us';
        gsap.set([dont, blame, us, blameMark], { autoAlpha: 1, x: 0, y: 0 });
        gsap.set(blameCode, { autoAlpha: 0 });
        shown.dont = true;
        shown.blame = true;
        shown.us = true;
      } else {
        gsap.set([dont, blame, us], { autoAlpha: 0, x: 0, y: 0 });
        gsap.set(blameCode, { autoAlpha: 0 });
        gsap.set(blameMark, { autoAlpha: 0 });
        syncFound();
      }

      const observer = new MutationObserver(syncFound);
      observer.observe(root, { attributes: true, attributeFilter: ['data-found-dont', 'data-found-blame', 'data-found-us'] });

      if (prefersReducedMotion()) {
        root.dataset.decode = 'done';
        return () => observer.disconnect();
      }

      gsap.set(mark, { autoAlpha: 0 });
      const play = () => {
        root.dataset.decode = 'done';
        gsap.fromTo(
          mark,
          { autoAlpha: 0, scale: 1.03, y: 16 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        );
      };

      const stopWaiting = whenHeroAvailable(play);
      return () => {
        observer.disconnect();
        stopWaiting();
      };
    },
    { scope: rootRef, dependencies: [playDont, playBlame, playUs] },
  );

  return (
    <section ref={rootRef} className="campaign-hero" aria-labelledby="campaign-title">
      <CampaignMark systemRef={markRef} />

      <h1 id="campaign-title" className="campaign-phrase" aria-label="dont blame us">
        <span className="campaign-phrase-word campaign-phrase-dont" ref={dontRef} aria-hidden="true">
          <span className="campaign-phrase-live" ref={dontLiveRef}>
            {seedGibberish('dont')}
          </span>
          <span className="campaign-phrase-ghost" />
        </span>
        <span className="campaign-phrase-blame" ref={blameRef} aria-hidden="true">
          <span className="campaign-phrase-blame-code" ref={blameCodeRef}>
            {seedGibberish('BLAME')}
          </span>
          <span className="campaign-phrase-blame-mark" ref={blameMarkRef}>
            <Image src="/blame-handwritten.png" alt="" width={1434} height={2334} priority />
          </span>
        </span>
        <span className="campaign-phrase-word campaign-phrase-us" ref={usRef} aria-hidden="true">
          <span className="campaign-phrase-live" ref={usLiveRef}>
            {seedGibberish('us')}
          </span>
          <span className="campaign-phrase-ghost" />
        </span>
      </h1>

      <p className="campaign-control campaign-collection">
        <DecodedText text="COLLECTION / 001" trigger="hero" duration={DECODE_DURATION.ui} delay={0.16} />
      </p>
      <Link className="campaign-control campaign-enter" href="/shop" aria-label="Shop">
        <DecodedText text="SHOP →" trigger="hero" duration={0.36} delay={0.24} hover accessible={false} />
      </Link>
    </section>
  );
});
