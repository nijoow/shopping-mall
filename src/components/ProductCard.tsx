'use client';
import React, { useState } from 'react';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';

const ProductCard = ({
  productId,
  ranking,
}: {
  productId: number;
  ranking?: number;
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const handleClickFavoriteButton = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/product/${productId}`}
      className="relative col-span-4 flex flex-col border-b border-r"
    >
      {ranking && (
        <div className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center bg-black text-white">
          <span className="text-1.25 font-medium">{ranking}</span>
        </div>
      )}
      <button
        className="absolute right-3 top-3 z-10 h-6 w-6"
        onClick={handleClickFavoriteButton}
      >
        {isFavorite && <IoHeartOutline size="auto" />}
        {!isFavorite && <IoHeartSharp size="auto" />}
      </button>
      <div className="relative aspect-square w-full">
        <Image
          src={'/images/product/example.png'}
          alt="예시 이미지"
          fill
          sizes="30vw"
          className="object-contain"
        />
      </div>
      <div className="bottom-0 flex w-full items-end justify-between p-2">
        <div className="flex flex-col">
          <span>product name</span>
          <div>color1</div>
        </div>
        <span>price</span>
      </div>
    </Link>
  );
};

export default ProductCard;
