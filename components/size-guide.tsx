'use client';

import { useEffect, useRef } from 'react';

const ROWS = [
  ['S', '58', '69', '53', '22'],
  ['M', '61', '72', '56', '23'],
  ['L', '64', '75', '59', '24'],
  ['XL', '67', '78', '62', '25'],
] as const;

export function SizeGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prior.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prior.current?.focus();
    };
  }, [onClose, open]);

  return (
    <dialog
      className="size-guide-dialog"
      open={open}
      aria-modal={open || undefined}
      aria-labelledby="size-guide-title"
      inert={!open}
    >
      <button
        className="size-guide-close"
        ref={closeRef}
        type="button"
        onClick={onClose}
      >
        Close
      </button>
      <p className="pdp-id">Garment measurements / cm</p>
      <h2 id="size-guide-title">Size guide</h2>
      <table className="size-guide-table">
        <caption className="visually-hidden">
          T-shirt measurements in centimeters
        </caption>
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Chest</th>
            <th scope="col">Body</th>
            <th scope="col">Shoulder</th>
            <th scope="col">Sleeve</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th scope="row" key={cell}>
                    {cell}
                  </th>
                ) : (
                  <td key={cell}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="size-guide-note">
        Model placeholder: 186 cm / wears M. Designed for an oversized
        silhouette. Choose your regular size for the intended fit.
      </p>
    </dialog>
  );
}
