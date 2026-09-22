export const sizes = ['S', 'M', 'L', 'XL'] as const;
export type Size = (typeof sizes)[number];

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: readonly [string, ...string[]];
  description: string;
  material: string;
  fit: string;
  gsm: number;
  sizes: readonly Size[];
  unavailableSizes?: readonly Size[];
};

// TEMPORARY Drop 001 catalog records.
// Replace names, prices, descriptions, and specs when final copy is confirmed.
const PLACEHOLDER_PRICE = 118;
const PLACEHOLDER_MATERIAL = '100% compact organic cotton';
const PLACEHOLDER_GSM = 180;
const PLACEHOLDER_DESCRIPTION = 'Drop 001 garment.';

const temporaryBase = {
  price: PLACEHOLDER_PRICE,
  material: PLACEHOLDER_MATERIAL,
  gsm: PLACEHOLDER_GSM,
  description: PLACEHOLDER_DESCRIPTION,
  sizes,
};

export const products: Product[] = [
  {
    ...temporaryBase,
    id: 'HAEL-001',
    name: 'HAEL 001',
    slug: 'hael-001',
    images: ['/products/drop-001/hael-001-front.png'],
    fit: 'Oversized / short sleeve',
  },
  {
    ...temporaryBase,
    id: 'HAEL-002',
    name: 'HAEL 002',
    slug: 'hael-002',
    images: ['/products/drop-001/hael-002-front.png'],
    fit: 'Oversized / short sleeve',
  },
  {
    ...temporaryBase,
    id: 'HAEL-003',
    name: 'HAEL 003',
    slug: 'hael-003',
    images: ['/products/drop-001/hael-003-front.png'],
    fit: 'Oversized / short sleeve',
  },
  {
    ...temporaryBase,
    id: 'HAEL-004',
    name: 'HAEL 004',
    slug: 'hael-004',
    images: ['/products/drop-001/hael-004-front.png'],
    fit: 'Oversized / long sleeve',
  },
  {
    ...temporaryBase,
    id: 'HAEL-005',
    name: 'HAEL 005',
    slug: 'hael-005',
    images: ['/products/drop-001/hael-005-front.png'],
    fit: 'Oversized / long sleeve',
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(slug: string, limit = 3) {
  return products.filter((product) => product.slug !== slug).slice(0, limit);
}
