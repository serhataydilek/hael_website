import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { WebMcpCartTools } from '@/components/webmcp-cart-tools';
import { StorefrontExperience } from '@/components/storefront-experience';
import { HaelCursor } from '@/components/hael-cursor';
import { buildLoaderBootScript } from '@/lib/loader-session';

export const metadata: Metadata = {
  title: { default: 'HAEL — Drop 001', template: '%s — HAEL' },
  description: 'HAEL Drop 001. Black garments, altered surfaces, and afterimages.',
};

const HAEL_LOADER_BOOT = buildLoaderBootScript();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preload" href="/fonts/Millimetre-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body><HaelCursor /><StorefrontExperience><WebMcpCartTools />{children}</StorefrontExperience><Script id="hael-loader-boot" strategy="beforeInteractive">{HAEL_LOADER_BOOT}</Script></body></html>;
}
