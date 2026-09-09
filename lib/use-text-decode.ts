'use client';

import { useCallback, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DECODE_CHARS, prefersReducedMotion, varyDuration } from '@/lib/text-decode';

gsap.registerPlugin(ScrambleTextPlugin);

type PlayOptions = {
  duration?: number;
  delay?: number;
  chars?: string;
};

export function useTextDecode(nodeRef: RefObject<HTMLElement | null>, text: string, duration = 0.4, delay = 0) {
  return useCallback(
    (overrides: PlayOptions = {}) => {
      const node = nodeRef.current;
      if (!node) return;
      if (prefersReducedMotion()) {
        node.textContent = text;
        return;
      }

      const nextDuration = varyDuration(overrides.duration ?? duration);
      const nextDelay = overrides.delay ?? delay;
      const chars = overrides.chars ?? DECODE_CHARS;
      const long = text.length > 48;

      gsap.killTweensOf(node);
      gsap.to(node, {
        duration: nextDuration,
        delay: nextDelay,
        ease: 'none',
        scrambleText: {
          text,
          chars,
          revealDelay: long ? Math.min(0.2, nextDuration * 0.28) : Math.min(0.12, nextDuration * 0.18),
          speed: long ? 0.55 : 0.62,
          tweenLength: false,
        },
        onComplete: () => {
          node.textContent = text;
        },
      });
    },
    [delay, duration, nodeRef, text],
  );
}
