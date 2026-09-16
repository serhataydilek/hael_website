'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const CURSOR_SRC = '/cursor/hael-cursor.webp';
const CURSOR_WIDTH = 18;
const CURSOR_HEIGHT = 10;
const HOTSPOT_X = 1;
const HOTSPOT_Y = 1;
const INTERACTIVE = 'a, button, [role="button"], [role="link"], label, select, summary, input, textarea';

function loaderPlaying() {
  return document.documentElement.dataset.haelLoaderMode === 'play';
}

function setNativeHidden(hidden: boolean) {
  if (hidden) document.documentElement.dataset.haelCursor = 'on';
  else document.documentElement.removeAttribute('data-hael-cursor');
}

export function HaelCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER);
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setNativeHidden(false);
      return;
    }

    const root = rootRef.current;
    const img = imgRef.current;
    if (!root || !img) return;

    let x = 0;
    let y = 0;
    let visible = false;
    let loaded = false;
    let hovering = false;
    let raf = 0;

    const render = () => {
      raf = 0;
      const show = loaded && visible && !loaderPlaying();
      root.style.opacity = show ? '1' : '0';
      setNativeHidden(show);
      if (!show) return;
      root.style.transform = `translate3d(${x - HOTSPOT_X}px, ${y - HOTSPOT_Y}px, 0)`;
      root.dataset.hover = hovering ? 'true' : 'false';
    };

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      x = event.clientX;
      y = event.clientY;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      hovering = Boolean(target?.closest(INTERACTIVE));
      visible = true;
      schedule();
    };

    const hide = () => {
      visible = false;
      schedule();
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) hide();
    };

    const onVisibility = () => {
      if (document.hidden) hide();
    };

    const onLoad = () => {
      loaded = img.naturalWidth > 0;
      schedule();
    };

    const onError = () => {
      loaded = false;
      setNativeHidden(false);
      schedule();
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    if (img.complete) onLoad();
    else void img.decode().then(onLoad).catch(onError);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hael-loader-mode'] });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      setNativeHidden(false);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="hael-cursor" ref={rootRef} aria-hidden="true">
      <Image
        ref={imgRef}
        className="hael-cursor-art"
        src={CURSOR_SRC}
        alt=""
        width={CURSOR_WIDTH}
        height={CURSOR_HEIGHT}
        unoptimized
        draggable={false}
      />
    </div>
  );
}
