'use client';

import { useEffect, useRef, type ElementType } from 'react';
import { useTextDecode } from '@/lib/use-text-decode';
import {
  DECODE_DURATION,
  hasDecoded,
  hasFinePointer,
  markDecoded,
  prefersReducedMotion,
  seedGibberish,
  whenHeroAvailable,
} from '@/lib/text-decode';

type DecodeTrigger = 'immediate' | 'hero' | 'inView' | 'open';

type DecodedTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  delay?: number;
  trigger?: DecodeTrigger;
  hover?: boolean;
  decodeId?: string;
  active?: boolean;
  accessible?: boolean;
  ariaLabel?: string;
};

export function DecodedText({
  text,
  as: Tag = 'span',
  className,
  duration = DECODE_DURATION.ui,
  delay = 0,
  trigger = 'inView',
  hover = false,
  decodeId,
  active = false,
  accessible = true,
  ariaLabel,
}: DecodedTextProps) {
  const visualRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const hovering = useRef(false);
  const play = useTextDecode(visualRef, text, duration, delay);
  const id = decodeId ?? text;

  useEffect(() => {
    const node = visualRef.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      node.textContent = text;
      return;
    }

    const start = () => {
      if (hasDecoded(id) && trigger !== 'open') {
        node.textContent = text;
        return;
      }
      play();
      if (trigger !== 'open') markDecoded(id);
    };

    if (trigger === 'immediate') {
      start();
      return;
    }

    if (trigger === 'hero') {
      return whenHeroAvailable(start);
    }

    if (trigger === 'open') {
      if (active) start();
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [active, id, play, text, trigger]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !hover || prefersReducedMotion()) return;

    const onEnter = () => {
      if (!hasFinePointer() || hovering.current) return;
      hovering.current = true;
      play({ duration: DECODE_DURATION.hover, delay: 0 });
    };
    const onLeave = () => {
      hovering.current = false;
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [hover, play]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        rootRef.current = node;
      }}
      className={className}
      aria-label={accessible ? ariaLabel ?? text : undefined}
    >
      <span className="decoded-final" aria-hidden="true">
        {text}
      </span>
      <span className="decoded-visual" ref={visualRef} aria-hidden="true">
        {seedGibberish(text)}
      </span>
    </Tag>
  );
}
