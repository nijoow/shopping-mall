'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import React from 'react';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';

const FavoriteButton = ({ productId }: { productId: number }) => {
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
    <button
      type="button"
      className="absolute right-0 top-0 z-10 h-9 w-9 p-1.5"
      onClick={handleClickFavoriteButton}
    >
      {!isFavorite && <IoHeartOutline size="auto" />}
      {isFavorite && <IoHeartSharp size="auto" />}
    </button>
  );
};

export default FavoriteButton;
