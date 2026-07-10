'use client';

import { toggleSavedProduct, useSavedProducts } from '@/lib/savedProducts';
import { Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';

const ProductCard = ({
  product,
  ranking,
}: {
  product: Product;
  ranking?: number;
}) => {
  const { productId, productName, price, colors, imageUrl, category } = product;

  const { saved: favorite } = useSavedProducts('favorite');
  const isFavorite = favorite[productId];

  const handleClickFavoriteButton = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    toggleSavedProduct('favorite', productId);
  };

  return (
    <Link
      href={`/product/${productId}`}
      className="street-card group relative flex flex-col overflow-hidden hover:border-volt/50"
    >
      {ranking && (
        <div className="display absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center bg-volt text-1 text-ink">
          {ranking}
        </div>
      )}
      <button
        type="button"
        aria-label={isFavorite ? '찜 해제' : '찜하기'}
        className="absolute right-1.5 top-1.5 z-10 flex h-9 w-9 items-center justify-center transition-transform hover:scale-110"
        onClick={handleClickFavoriteButton}
      >
        {isFavorite ? (
          <IoHeartSharp size={21} className="fill-neon-pink" />
        ) : (
          <IoHeartOutline size={21} className="text-foreground/70" />
        )}
      </button>

      {/* 이미지 존 — 밝은 상품컷 대비를 위한 페이퍼 배경 */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f4f2ec]">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex w-full flex-auto flex-col gap-1 p-3">
        <span className="eyebrow text-0.625">{category}</span>
        <span className="line-clamp-2 text-0.875 font-medium leading-tight">
          {productName}
        </span>
        <div className="mt-auto flex w-full items-center gap-1 pt-1.5">
          {colors.map(color => (
            <span
              key={`${productId}${color}`}
              style={{ backgroundColor: color }}
              className="h-3 w-3 border border-input"
            />
          ))}
          <span className="display ml-auto text-0.875">
            ₩{commaToCurrency(price)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
