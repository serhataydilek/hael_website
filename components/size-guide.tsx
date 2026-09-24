'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    prior.current = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      prior.current?.focus?.();
    };
  }, [onClose, open]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <dialog
      className="size-guide-dialog"
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={trapFocus}
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
