import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HAEL_CONTACT_HREF, HAEL_INSTAGRAM_HREF } from '@/lib/site-footer';

function FooterPlaceholderLink({ children }: { children: ReactNode }) {
  return (
    <a
      aria-disabled="true"
      className="footer-placeholder-link"
      href="#footer-destination"
      tabIndex={0}
      title="Destination coming soon"
    >
      {children}
    </a>
  );
}

function SocialIcon({
  name,
}: {
  name: 'instagram' | 'tiktok' | 'youtube' | 'spotify';
}) {
  if (name === 'instagram') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1" className="footer-social-dot" />
      </svg>
    );
  }

  if (name === 'tiktok') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14 3v11.1a3.7 3.7 0 1 1-3-3.64" />
        <path d="M14 3c.65 2.6 2.2 4.15 4.5 4.5" />
      </svg>
    );
  }

  if (name === 'youtube') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21 12c0 3.6-.4 5.8-1.3 6.6C18.8 19.5 16.3 20 12 20s-6.8-.5-7.7-1.4C3.4 17.8 3 15.6 3 12s.4-5.8 1.3-6.6C5.2 4.5 7.7 4 12 4s6.8.5 7.7 1.4C20.6 6.2 21 8.4 21 12Z" />
        <path d="m10 8.8 5 3.2-5 3.2Z" className="footer-social-fill" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M7.2 9.3c3.5-1 6.5-.7 9.5.7M7.2 12c3.5-1 6.5-.7 9.5.7M7.2 14.7c3.1-.8 5.8-.5 8.2.6" />
    </svg>
  );
}

function SocialLink({
  label,
  name,
  href,
}: {
  label: string;
  name: 'instagram' | 'tiktok' | 'youtube' | 'spotify';
  href?: string;
}) {
  const icon = <SocialIcon name={name} />;
  return href ? (
    <a aria-label={label} href={href} rel="noreferrer noopener" target="_blank">
      {icon}
    </a>
  ) : (
    <FooterPlaceholderLink>{icon}</FooterPlaceholderLink>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main-row">
          <nav
            className="footer-primary-nav footer-primary-nav-left"
            aria-label="Primary footer"
          >
            <Link href="/shop">Shop</Link>
            <FooterPlaceholderLink>Collections</FooterPlaceholderLink>
            <FooterPlaceholderLink>About</FooterPlaceholderLink>
          </nav>
          <Link className="footer-wordmark" href="/" aria-label="HAEL home">
            <Image
              src="/brand/hael-wordmark.png"
              alt=""
              width={632}
              height={634}
              unoptimized
            />
          </Link>
          <nav
            className="footer-primary-nav footer-primary-nav-right"
            aria-label="Support footer"
          >
            <a href={HAEL_CONTACT_HREF}>Contact</a>
            <FooterPlaceholderLink>FAQ</FooterPlaceholderLink>
            <FooterPlaceholderLink>Support</FooterPlaceholderLink>
          </nav>
        </div>
        <div className="footer-divider" />
        <div className="footer-social-row" aria-label="Social links">
          <SocialLink
            label="Instagram"
            name="instagram"
            href={HAEL_INSTAGRAM_HREF}
          />
          <SocialLink label="TikTok" name="tiktok" />
          <SocialLink label="YouTube" name="youtube" />
          <SocialLink label="Spotify" name="spotify" />
        </div>
        <div className="footer-meta-row">
          <p>© 2024 HAEL. ALL RIGHTS RESERVED.</p>
          <nav aria-label="Legal footer">
            <FooterPlaceholderLink>Privacy</FooterPlaceholderLink>
            <FooterPlaceholderLink>Terms</FooterPlaceholderLink>
            <FooterPlaceholderLink>Cookies</FooterPlaceholderLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
