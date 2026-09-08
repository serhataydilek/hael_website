export const sizes = ['S', 'M', 'L', 'XL'] as const;
export type Size = (typeof sizes)[number];

export type Product = {
  id: string; name: string; slug: string; price: number; images: string[];
  description: string; material: string; fit: string; gsm: number; sizes: readonly Size[];
};

const base = { images: ['/product-form.png', '/product-detail.png'], material: '100% compact organic cotton', sizes };

export const products: Product[] = [
  { ...base, id: 'P-001-A', name: 'Volume Tee', slug: 'volume-tee', price: 118, description: 'A measured oversized T-shirt with a dense hand and controlled drape.', fit: 'Oversized / dropped shoulder', gsm: 280 },
  { ...base, id: 'P-001-B', name: 'Axis Tee', slug: 'axis-tee', price: 126, description: 'An asymmetric seam study built around a straight, relaxed body.', fit: 'Relaxed / offset seam', gsm: 260 },
  { ...base, id: 'P-001-C', name: 'Field Tee', slug: 'field-tee', price: 112, description: 'A compact daily layer with a slightly shortened architectural proportion.', fit: 'Boxy / cropped length', gsm: 240 },
  { ...base, id: 'P-001-D', name: 'Relief Tee', slug: 'relief-tee', price: 132, description: 'Dense jersey shaped by a subtle articulated side panel.', fit: 'Regular / articulated side', gsm: 300 },
  { ...base, id: 'P-001-E', name: 'Span Tee', slug: 'span-tee', price: 120, description: 'Wide through the chest with a quiet taper at the hem.', fit: 'Wide / tapered hem', gsm: 270 },
  { ...base, id: 'P-001-F', name: 'Datum Tee', slug: 'datum-tee', price: 108, description: 'The collection baseline: balanced weight, proportion and restraint.', fit: 'Regular / straight body', gsm: 250 },
  { ...base, id: 'P-001-G', name: 'Void Tee', slug: 'void-tee', price: 138, description: 'A longer silhouette with a deep side split and reinforced neckline.', fit: 'Long / side split', gsm: 290 },
  { ...base, id: 'P-001-H', name: 'Fold Tee', slug: 'fold-tee', price: 128, description: 'An inward shoulder fold creates structure without added volume.', fit: 'Relaxed / shaped shoulder', gsm: 265 },
  { ...base, id: 'P-001-I', name: 'Trace Tee', slug: 'trace-tee', price: 116, description: 'A lightweight study with exposed cover-stitch construction.', fit: 'Slim / elongated sleeve', gsm: 220 },
  { ...base, id: 'P-001-J', name: 'Mass Tee', slug: 'mass-tee', price: 142, description: 'The heaviest garment in the system, cut with deliberate volume.', fit: 'Oversized / rigid drape', gsm: 340 },
];

export function getProduct(slug: string) { return products.find((product) => product.slug === slug); }
