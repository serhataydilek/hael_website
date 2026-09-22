import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { StorefrontExperience } from '@/components/storefront-experience';
import { StorefrontShell } from '@/components/storefront-shell';
import { WebMcpCartTools } from '@/components/webmcp-cart-tools';
import { buildLoaderBootScript } from '@/lib/loader-session';

export const metadata: Metadata = {
  metadataBase: new URL('https://hael.studio'),
  title: { default: 'HAEL — Drop 001', template: '%s — HAEL' },
  description: 'HAEL Drop 001 collection.',
  icons: { icon: '/brand/hael-footer-mark-soft.png' },
  openGraph: {
    title: 'HAEL — Drop 001',
    description: 'HAEL Drop 001 collection.',
    images: [{ url: '/dont-blame-us.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HAEL — Drop 001',
    description: 'HAEL Drop 001 collection.',
    images: ['/dont-blame-us.png'],
  },
};

export const viewport: Viewport = { themeColor: '#171717' };

const HAEL_LOADER_BOOT = buildLoaderBootScript();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StorefrontExperience>
          <WebMcpCartTools />
          <StorefrontShell>{children}</StorefrontShell>
        </StorefrontExperience>
        <Script id="hael-loader-boot" strategy="beforeInteractive">
          {HAEL_LOADER_BOOT}
        </Script>
      </body>
    </html>
  );
}
