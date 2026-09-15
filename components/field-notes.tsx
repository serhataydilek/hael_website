'use client';

import Link from 'next/link';
import { memo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DECODE_CHARS, prefersReducedMotion } from '@/lib/text-decode';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LABEL = 'HAEL / FIELD NOTES';
const META_A = 'FIELD NOTE / 001';
const META_B = 'ISTANBUL / 2026';
const BODY_LINES = ['Built from abrasion,', 'repetition, and the', 'trace a body leaves', 'behind.'];
const ASIDE = 'The graphic is not decoration.';
const CLOSE = 'It is the evidence.';
const CTA = 'View the complete drop →';

const INITIAL: Record<string, number> = {
  label: 0.88,
  meta: 0.9,
  body: 0.65,
  aside: 0.84,
  close: 1,
  cta: 0,
};

function hashChar(text: string, index: number) {
  let seed = 2166136261;
  for (let i = 0; i < text.length; i += 1) seed = Math.imul(seed ^ text.charCodeAt(i), 16777619);
  return Math.abs(Math.imul(seed ^ index, 16777619));
}

function corruptChar(ch: string, text: string, index: number) {
  if (ch === ' ' || ch === '\n' || ch === '→') return ch;
  return DECODE_CHARS[hashChar(text, index) % DECODE_CHARS.length];
}

function PrintField({
  text,
  variant,
  className,
  as: Tag = 'p',
  silent = false,
}: {
  text: string;
  variant: keyof typeof INITIAL;
  className?: string;
  as?: 'p' | 'span';
  silent?: boolean;
}) {
  return (
    <Tag className={className} aria-label={silent ? undefined : text} data-print={variant}>
      {Array.from(text).map((ch, index) => (
        <span
          key={`${ch}-${index}`}
          className={ch === ' ' ? 'print-space' : 'print-ch'}
          data-final={ch}
          data-corrupt={corruptChar(ch, text, index)}
        >
          {ch}
        </span>
      ))}
    </Tag>
  );
}

export const FieldNotes = memo(function FieldNotes() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const bind = (fn: () => void) => (contextSafe ? contextSafe(fn) : fn);
      const root = rootRef.current;
      if (!root) return;
      const reduced = prefersReducedMotion();
      const fields = Array.from(root.querySelectorAll<HTMLElement>('[data-print]'));
      let maxProgress = 0;
      let ranked = false;

      const lettersOf = (field: HTMLElement) =>
        Array.from(field.querySelectorAll<HTMLElement>('.print-ch')).filter((node) => node.dataset.final && node.dataset.final !== '→');

      const lock = (node: HTMLElement) => {
        if (node.dataset.locked === '1') return;
        node.dataset.locked = '1';
        node.textContent = node.dataset.final ?? node.textContent;
      };

      const rankField = (field: HTMLElement) => {
        const variant = field.dataset.print ?? 'body';
        const initial = INITIAL[variant] ?? 0.65;
        const letters = lettersOf(field);
        if (!letters.length) return;

        if (variant === 'cta') return;
        if (reduced || initial >= 1) {
          letters.forEach(lock);
          return;
        }

        const box = root.getBoundingClientRect();
        const spine = Number.parseFloat(getComputedStyle(root).getPropertyValue('--spine')) || box.width * 0.42;

        letters.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const localX = rect.left + rect.width / 2 - box.left;
          node.dataset.dist = String(Math.abs(localX - spine));
        });

        letters.sort((a, b) => Number(a.dataset.dist) - Number(b.dataset.dist));
        const preset = Math.max(1, Math.round(letters.length * initial));
        const remaining = Math.max(1, letters.length - preset);
        letters.forEach((node, index) => {
          if (index < preset) {
            lock(node);
            return;
          }
          node.dataset.unlock = String((index - preset) / remaining);
          node.textContent = node.dataset.corrupt ?? node.dataset.final ?? '';
        });
      };

      const applyProgress = (progress: number) => {
        maxProgress = Math.max(maxProgress, progress);
        fields.forEach((field) => {
          const variant = field.dataset.print ?? '';
          if (variant === 'close' || variant === 'cta') return;
          lettersOf(field).forEach((node) => {
            if (node.dataset.locked === '1') return;
            if (Number(node.dataset.unlock ?? 1) <= maxProgress) lock(node);
          });
        });
      };

      const timers: number[] = [];
      let ctaDone = false;

      const setup = () => {
        if (ranked) return;
        ranked = true;
        fields.forEach(rankField);
        applyProgress(0);
        if (cta && !reduced && !ctaDone) {
          lettersOf(cta).forEach((node, index) => {
            if (index % 3 === 1) node.textContent = node.dataset.corrupt ?? node.dataset.final ?? '';
            else lock(node);
          });
        }
      };

      const close = root.querySelector<HTMLElement>('[data-print="close"]');
      const cta = root.querySelector<HTMLElement>('[data-print="cta"]');

      if (!reduced && close) gsap.set(close, { autoAlpha: 0.72 });

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 86%',
        end: 'bottom 58%',
        onEnter: bind(setup),
        onRefresh: bind(() => {
          if (!ranked) return;
          applyProgress(maxProgress);
        }),
        onUpdate: (self) => {
          if (!ranked) setup();
          applyProgress(self.progress);
          if (!reduced && close) {
            gsap.set(close, { autoAlpha: 0.72 + 0.28 * Math.min(1, self.progress * 1.4), overwrite: 'auto' });
          }
        },
      });

      const resolveCta = bind(() => {
        if (!ranked) setup();
        if (ctaDone || !cta) return;
        ctaDone = true;
        const letters = lettersOf(cta);
        if (reduced) {
          letters.forEach(lock);
          return;
        }
        const pending = letters.filter((node) => node.dataset.locked !== '1');
        const span = Math.max(28, Math.round(260 / Math.max(1, pending.length)));
        pending.forEach((node, index) => {
          timers.push(window.setTimeout(() => lock(node), 40 + index * span));
        });
      });

      const ctaObserver = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          ctaObserver.disconnect();
          resolveCta();
        },
        { threshold: 0.55 },
      );
      if (cta) ctaObserver.observe(cta);

      return () => {
        trigger.kill();
        ctaObserver.disconnect();
        timers.forEach((id) => window.clearTimeout(id));
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="manifesto page-shell" aria-label="HAEL field notes">
      <PrintField className="manifesto-kicker" text={LABEL} variant="label" />
      <PrintField className="manifesto-meta manifesto-meta-a" text={META_A} variant="meta" />
      <p className="manifesto-a" aria-label={BODY_LINES.join(' ')} data-print="body">
        {BODY_LINES.map((line, lineIndex) => (
          <span key={line} className="manifesto-line">
            {Array.from(line).map((ch, index) => (
              <span
                key={`${lineIndex}-${index}`}
                className={ch === ' ' ? 'print-space' : 'print-ch'}
                data-final={ch}
                data-corrupt={corruptChar(ch, line, index)}
              >
                {ch}
              </span>
            ))}
            {lineIndex < BODY_LINES.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
      <PrintField className="manifesto-b" text={ASIDE} variant="aside" />
      <PrintField className="manifesto-c" text={CLOSE} variant="close" />
      <PrintField className="manifesto-meta manifesto-meta-b" text={META_B} variant="meta" />
      <Link className="text-link manifesto-cta" href="/shop" aria-label="View the complete drop">
        <PrintField text={CTA} variant="cta" as="span" className="manifesto-cta-label" silent />
      </Link>
      <p className="manifesto-balance-meta" aria-label="Clothing. Objects. A state of mind.">
        <span>CLOTHING</span>
        <span>OBJECTS</span>
        <span>A STATE OF MIND.</span>
      </p>
    </section>
  );
});
