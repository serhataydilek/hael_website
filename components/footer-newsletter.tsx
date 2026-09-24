'use client';

import { useState } from 'react';

export function FooterNewsletter() {
  const [notice, setNotice] = useState('');

  return (
    <form
      className="footer-newsletter"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice('Newsletter signup coming soon.');
      }}
    >
      <div className="footer-newsletter-copy">
        <p>Join our mailing list</p>
        <label htmlFor="footer-email">For news, drops and updates.</label>
      </div>
      <div className="footer-newsletter-fields">
        <input
          id="footer-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          required
        />
        <button type="submit">Join</button>
      </div>
      <output className="footer-newsletter-notice" aria-live="polite">
        {notice}
      </output>
    </form>
  );
}
