'use client';
import React, { useState } from 'react';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';

const ProductCard = ({ ranking }: { ranking?: number }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const handleClickFavoriteButton = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="col-span-4 border-r border-b relative">
      {ranking && (
        <div className="absolute left-0 top-0 w-12 h-12 text-white flex items-center justify-center bg-black">
          <span className="text-1.25 font-medium">{ranking}</span>
        </div>
      )}
      <button
        className="absolute right-3 top-3 w-6 h-6"
        onClick={handleClickFavoriteButton}
      >
        {isFavorite && <IoHeartOutline size="auto" />}
        {!isFavorite && <IoHeartSharp size="auto" />}
      </button>
      <div className="h-full"></div>
      <div className="flex justify-between items-end p-2 w-full absolute bottom-0">
        <div className="flex flex-col">
          <span>product name</span>
          <div>color1</div>
        </div>
        <span>price</span>
      </div>
    </div>
  );
};

export default ProductCard;
