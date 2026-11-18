'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS } from '@/domain/catalog';
import { ProductCard } from './ProductCard';
import { EmptyState } from './StateView';
const categories = [
  ['all', '전체'],
  ['sneakers', '스니커즈'],
  ['clothing', '의류'],
  ['accessories', '잡화'],
];
export function Shop({ category }: { category: string }) {
  const params = useSearchParams(),
    router = useRouter(),
    q = params.get('q') ?? '',
    [filter, setFilter] = useState(params.get('custom') === '1'),
    [sort, setSort] = useState('editorial');
  const products = useMemo(() => {
    let result = PRODUCTS.filter(
      p =>
        (category === 'all' || p.category === category) &&
        (!filter || p.model) &&
        (!q ||
          `${p.name} ${p.subtitle} ${p.description} ${p.id}`
            .toLowerCase()
            .includes(q.toLowerCase())),
    );
    if (sort === 'asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'desc') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [category, filter, sort, q]);
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">A NEW PERSPECTIVE ON EVERYDAY</span>
          <h1>
            THE COLLECTION<span className="red-dot">.</span>
          </h1>
          <p>
            {q ? `“${q}” 검색 결과` : '스니커즈부터 일상의 작은 오브젝트까지.'}
          </p>
        </div>
        <span className="eyebrow">{products.length} ITEMS</span>
      </div>
      <div className="shop-toolbar">
        <nav aria-label="상품 분류">
          {categories.map(([id, label]) => (
            <Link
              key={id}
              href={`/shop/${id}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
              aria-current={id === category ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={filter}
              onChange={e => setFilter(e.target.checked)}
            />
            3D 커스텀
          </label>
          <select
            aria-label="상품 정렬"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="editorial">에디터 추천순</option>
            <option value="asc">낮은 가격순</option>
            <option value="desc">높은 가격순</option>
          </select>
        </div>
      </div>
      {q && (
        <button
          className="query-chip"
          onClick={() => router.push(`/shop/${category}`)}
        >
          검색: {q} ×
        </button>
      )}
      {products.length ? (
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <>
          <EmptyState
            title="다른 조합을 찾아볼까?"
            text="조건에 맞는 상품이 없어. 검색어나 필터를 바꿔봐."
          />
          <button
            className="button outline"
            onClick={() => {
              setFilter(false);
              router.push('/shop/all');
            }}
          >
            조건 초기화
          </button>
        </>
      )}
    </div>
  );
}
