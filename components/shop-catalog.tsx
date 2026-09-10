'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DecodedText } from '@/components/decoded-text';
import type { Product } from '@/lib/products';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

function getFit(product: Product) {
  return product.fit.split('/')[0].trim();
}

function getWeight(product: Product) {
  if (product.gsm < 250) return 'Light';
  if (product.gsm < 290) return 'Medium';
  return 'Heavy';
}

export function ShopCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');
  const [fit, setFit] = useState('all');
  const [weight, setWeight] = useState('all');
  const [size, setSize] = useState('all');

  const fitOptions = useMemo(() => Array.from(new Set(products.map(getFit))).sort(), [products]);
  const sizeOptions = useMemo(() => Array.from(new Set(products.flatMap((product) => product.sizes))), [products]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = products.filter((product) => {
      const searchable = `${product.name} ${product.id} ${product.description} ${product.fit} ${product.material}`.toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (fit === 'all' || getFit(product) === fit) &&
        (weight === 'all' || getWeight(product) === weight) &&
        (size === 'all' || product.sizes.includes(size as (typeof product.sizes)[number]))
      );
    });

    return [...matches].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [fit, products, query, size, sort, weight]);

  const hasFilters = Boolean(query || fit !== 'all' || weight !== 'all' || size !== 'all');
  const resetFilters = () => {
    setQuery('');
    setFit('all');
    setWeight('all');
    setSize('all');
  };

  return (
    <>
      <section className="catalog-tools page-shell" aria-label="Search, sort, and filter products">
        <label className="catalog-search">
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, code, or detail"
          />
        </label>

        <div className="catalog-selects">
          <label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
          <label><span>Fit</span><select value={fit} onChange={(event) => setFit(event.target.value)}><option value="all">All fits</option>{fitOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label><span>Weight</span><select value={weight} onChange={(event) => setWeight(event.target.value)}><option value="all">All weights</option><option value="Light">Light · under 250 GSM</option><option value="Medium">Medium · 250–289 GSM</option><option value="Heavy">Heavy · 290+ GSM</option></select></label>
          <label><span>Size</span><select value={size} onChange={(event) => setSize(event.target.value)}><option value="all">All sizes</option>{sizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        </div>

        <div className="catalog-status" aria-live="polite">
          <span>{visibleProducts.length} results</span>
          {hasFilters && <button type="button" onClick={resetFilters}>Clear filters</button>}
        </div>
      </section>

      {visibleProducts.length > 0 ? (
        <section className="catalog page-shell" aria-label="HAEL Drop 001 products">
          {visibleProducts.map((product, index) => (
            <Link className={`catalog-item catalog-item-${index % 4}`} href={`/product/${product.slug}`} key={product.id}>
              <div className="catalog-image">
                <Image className="catalog-primary" src={product.images[0]} alt={`${product.name} flat-lay product view`} fill sizes="(max-width: 800px) 50vw, 25vw" unoptimized style={{ objectFit: 'contain', objectPosition: 'center' }} />
                {product.images[1] && <Image className="catalog-alternate" src={product.images[1]} alt={`${product.name} alternate view`} fill sizes="(max-width: 800px) 50vw, 25vw" unoptimized style={{ objectFit: 'contain', objectPosition: 'center' }} />}
                <DecodedText text={`NO. ${String(index + 1).padStart(2, '0')}`} trigger="inView" duration={0.3} decodeId={`shop-no-${product.id}`} />
              </div>
              <div className="catalog-info"><p><strong>{product.name}</strong><span>{product.id}</span></p><span>€{product.price}</span></div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="catalog-empty page-shell">
          <p>No objects match this selection.</p>
          <button type="button" onClick={resetFilters}>Reset search and filters</button>
        </section>
      )}
    </>
  );
}
