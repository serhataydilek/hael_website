'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductTile } from '@/components/product-tile';
import { sizes, type Product, type Size } from '@/lib/products';

type SortOption = 'latest' | 'price-low' | 'price-high';

const SORT_LABELS: Record<SortOption, string> = {
  latest: 'Latest',
  'price-low': 'Price low → high',
  'price-high': 'Price high → low',
};

const PLACEHOLDER_SLOTS = 3;

function productHasSize(product: Product, size: Size) {
  return (
    product.sizes.includes(size) && !product.unavailableSizes?.includes(size)
  );
}

export function ShopCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('latest');
  const [fits, setFits] = useState<string[]>([]);
  const [sizeFilters, setSizeFilters] = useState<Size[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const fitOptions = useMemo(
    () => [...new Set(products.map((product) => product.fit))],
    [products],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (fits.length && !fits.includes(product.fit)) return false;
      if (
        sizeFilters.length &&
        !sizeFilters.some((size) => productHasSize(product, size))
      ) {
        return false;
      }
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.id.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [fits, products, query, sizeFilters, sort]);

  const filterActive = fits.length + sizeFilters.length > 0;
  const showPlaceholders =
    !query.trim() && !filterActive && visible.length === products.length;

  useEffect(() => {
    if (!filterOpen && !sortOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) {
        setFilterOpen(false);
        setSortOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFilterOpen(false);
        setSortOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [filterOpen, sortOpen]);

  const toggleFit = (fit: string) => {
    setFits((current) =>
      current.includes(fit)
        ? current.filter((value) => value !== fit)
        : [...current, fit],
    );
  };

  const toggleSize = (size: Size) => {
    setSizeFilters((current) =>
      current.includes(size)
        ? current.filter((value) => value !== size)
        : [...current, size],
    );
  };

  return (
    <div className="shop-page">
      <div className="shop-tools" ref={toolsRef}>
        <h1>
          Drop 001 <span>({products.length})</span>
        </h1>

        <label className="shop-search">
          <span className="visually-hidden">Search Drop 001</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
            <circle
              cx="7"
              cy="7"
              r="4.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M10.2 10.2 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </label>

        <div className="shop-views">
          <p>
            {visible.length} {visible.length === 1 ? 'result' : 'results'}
          </p>
          <button
            type="button"
            className="shop-filter-trigger"
            aria-expanded={filterOpen}
            aria-controls="shop-filter-panel"
            onClick={() => {
              setFilterOpen((open) => !open);
              setSortOpen(false);
            }}
          >
            Filter
            <i aria-hidden="true" />
          </button>
        </div>

        {filterOpen ? (
          <div className="shop-filter" id="shop-filter-panel">
            <div className="shop-filter-head">
              <p>Filter</p>
              <button type="button" onClick={() => setFilterOpen(false)}>
                Close
              </button>
            </div>
            <fieldset>
              <legend>Fit</legend>
              {fitOptions.map((fit) => (
                <label key={fit}>
                  <input
                    type="checkbox"
                    checked={fits.includes(fit)}
                    onChange={() => toggleFit(fit)}
                  />
                  <span>{fit}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Size</legend>
              <div className="shop-filter-sizes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={sizeFilters.includes(size)}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
            {filterActive ? (
              <button
                type="button"
                className="shop-filter-clear"
                onClick={() => {
                  setFits([]);
                  setSizeFilters([]);
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="shop-sort">
          <button
            type="button"
            aria-expanded={sortOpen}
            onClick={() => {
              setSortOpen((open) => !open);
              setFilterOpen(false);
            }}
          >
            Sort by: {SORT_LABELS[sort]}
          </button>
          {sortOpen ? (
            <div className="shop-sort-menu">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sort === value}
                  onClick={() => {
                    setSort(value);
                    setSortOpen(false);
                  }}
                >
                  {SORT_LABELS[value]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <section className="shop-grid" aria-label="Drop 001 products">
        {visible.length ? (
          <>
            {visible.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                sizes="(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 23vw"
              />
            ))}
            {showPlaceholders
              ? Array.from({ length: PLACEHOLDER_SLOTS }, (_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="shop-placeholder"
                    aria-hidden="true"
                  >
                    <span>Coming soon</span>
                    <strong>HAEL</strong>
                    <span>Drop 001</span>
                  </div>
                ))
              : null}
          </>
        ) : (
          <p className="shop-empty">No results.</p>
        )}
      </section>
    </div>
  );
}
