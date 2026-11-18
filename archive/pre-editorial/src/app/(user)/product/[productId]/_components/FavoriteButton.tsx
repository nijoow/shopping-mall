'use client';

import { toggleFavorite, useFavorites } from '@/lib/savedProducts';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';

const FavoriteButton = ({ productId }: { productId: number }) => {
  const { favorite } = useFavorites();

  const isFavorite = favorite[productId];

  return (
    <button
      type="button"
      aria-label={isFavorite ? '찜 해제' : '찜하기'}
      className="flex h-11 w-11 shrink-0 items-center justify-center border border-border transition-colors hover:border-neon-pink hover:text-neon-pink"
      onClick={() => toggleFavorite(productId)}
    >
      {isFavorite ? (
        <IoHeartSharp size={20} className="fill-neon-pink" />
      ) : (
        <IoHeartOutline size={20} />
      )}
    </button>
  );
};

export default FavoriteButton;
