import { CartView } from '@/components/cart-view';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
export const metadata = { title: 'Bag' };
export default function CartPage() { return <main><SiteHeader /><CartView /><SiteFooter /></main>; }
