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
    <table className="size-guide-table"><caption className="visually-hidden">T-shirt measurements in centimeters</caption><thead><tr><th scope="col">SIZE</th><th scope="col">CHEST</th><th scope="col">BODY</th><th scope="col">SHOULDER</th><th scope="col">SLEEVE</th></tr></thead><tbody>{[['S','58','69','53','22'],['M','61','72','56','23'],['L','64','75','59','24'],['XL','67','78','62','25']].map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table>
    <p className="size-guide-note">Model placeholder: 186 cm / wears M. Designed for an oversized silhouette. Choose your regular size for the intended fit.</p>
  </dialog>;
}
