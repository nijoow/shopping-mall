'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types/types';
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
  const { productId, productName, price, colors, imageUrl } = product;

  const [favorite, setFavorite] =
    useLocalStorage<Record<number, boolean>>('favorite');

  const handleClickFavoriteButton = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    setFavorite({ ...favorite, [productId]: !favorite?.[productId] });
  };

  const isFavorite = favorite?.[productId];

  return (
    <Link
      href={`/product/${productId}`}
      className="relative col-span-6 flex flex-col border-b border-r bg-gray-50 sm:col-span-4 xl:col-span-3"
    >
      {ranking && (
        <div className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center bg-black text-white">
          <span className="text-1.25 font-medium">{ranking}</span>
        </div>
      )}
      <button
        type="button"
        className="absolute right-0 top-0 z-10 h-9 w-9 p-1.5"
        onClick={handleClickFavoriteButton}
      >
        {!isFavorite && <IoHeartOutline size="auto" />}
        {isFavorite && <IoHeartSharp size="auto" />}
      </button>
      <div className="relative aspect-square w-full">
        <Image
          src={imageUrl}
          alt="예시 이미지"
          fill
          sizes="30vw"
          className="object-contain"
        />
      </div>
      <div className="bottom-0 flex w-full items-end justify-between p-2">
        <div className="flex flex-col">
          <span>{productName}</span>
          <div>color1</div>
        </div>
        <span>{price}</span>
      </div>
    </Link>
  );
};

export default ProductCard;
