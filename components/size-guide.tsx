'use client';

import { useEffect, useRef } from 'react';

export function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    priorFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('keydown', close); priorFocus.current?.focus(); };
  }, [onClose, open]);
  const trap = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    if (buttons.length === 1) event.preventDefault();
  };
  return <dialog className="size-guide-dialog" open={open} aria-modal={open || undefined} aria-labelledby="size-guide-title" inert={!open} onKeyDown={trap}>
    <button className="size-guide-close" ref={closeRef} type="button" onClick={onClose}>CLOSE <span aria-hidden="true">×</span></button>
    <p className="eyebrow">GARMENT MEASUREMENTS / CM</p><h2 id="size-guide-title">Size guide</h2>
    <div className="size-guide-table" role="table" aria-label="T-shirt measurements in centimeters"><div role="row"><b role="columnheader">SIZE</b><b role="columnheader">CHEST</b><b role="columnheader">BODY</b><b role="columnheader">SHOULDER</b><b role="columnheader">SLEEVE</b></div>{[['S','58','69','53','22'],['M','61','72','56','23'],['L','64','75','59','24'],['XL','67','78','62','25']].map((row) => <div role="row" key={row[0]}>{row.map((cell, index) => <span role={index === 0 ? 'rowheader' : 'cell'} key={cell}>{cell}</span>)}</div>)}</div>
    <p className="size-guide-note">Model placeholder: 186 cm / wears M. Designed for an oversized silhouette. Choose your regular size for the intended fit.</p>
  </dialog>;
}
