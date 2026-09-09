import type { Metadata } from 'next';
import './globals.css';
import { WebMcpCartTools } from '@/components/webmcp-cart-tools';
import { StorefrontExperience } from '@/components/storefront-experience';

export const metadata: Metadata = {
  title: { default: 'HAEL — Drop 001', template: '%s — HAEL' },
  description: 'HAEL Drop 001. Black garments, altered surfaces, and afterimages.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><StorefrontExperience><WebMcpCartTools />{children}</StorefrontExperience></body></html>;
}
