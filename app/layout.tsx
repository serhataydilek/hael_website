import type { Metadata } from 'next';
import './globals.css';
import { WebMcpCartTools } from '@/components/webmcp-cart-tools';

export const metadata: Metadata = {
  title: { default: 'PEYAM — Collection 001', template: '%s — PEYAM' },
  description: 'Independent garment studies in black cotton. Collection 001.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WebMcpCartTools />{children}</body></html>;
}
