'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart } from 'lucide-react';
import { money, type Product } from '@/domain/catalog';
import { useDemo } from './DemoProvider';
export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index?: number;
}) {
  const { state, mutate, notify } = useDemo();
  const favorite = state?.favorites.includes(product.id) ?? false;
  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link
          href={`/product/${product.id}`}
          aria-label={`${product.name} 상품 보기`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
          />
        </Link>
        <span className="product-index">
          {String((index ?? 0) + 1).padStart(2, '0')}
        </span>
        {product.model && <span className="model-badge">3D CUSTOM</span>}
        <button
          className={`favorite-button ${favorite ? 'active' : ''}`}
          disabled={!state}
          aria-label={`${product.name} ${favorite ? '찜 해제' : '찜하기'}`}
          aria-pressed={favorite}
          onClick={async () => {
            try {
              await mutate('favorite', product.id);
            } catch (e) {
              notify((e as Error).message);
            }
          }}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <Link className="product-card-info" href={`/product/${product.id}`}>
        <div>
          <span className="eyebrow">
            {product.category === 'sneakers'
              ? 'FOOTWEAR'
              : product.category === 'clothing'
                ? 'CLOTHING'
                : 'ACCESSORIES'}
          </span>
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>
        </div>
        <ArrowUpRight size={19} />
        <strong>{money(product.price)}</strong>
      </Link>
    </article>
  );
}
