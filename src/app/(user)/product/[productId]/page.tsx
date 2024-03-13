import { getProductByProductId } from '@/lib/database/product';
import React from 'react';
import Image from 'next/image';
import { commaToCurrency } from '@/lib/utils/commaToCurrency';
import ProductNavigation from './_components/ProductNavigation';

export default async function ProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = await getProductByProductId(Number(productId));

  if (!product)
    return (
      <div className="h-full flex items-center justify-center">
        상품이 존재하지 않습니다.
      </div>
    );

  return (
    <div className="w-full h-fit grid grid-cols-12 justify-center gap-x-10 max-w-7xl mx-auto p-16">
      <div className="col-span-3 flex flex-col">
        <div className="sticky top-48">
          <span className="text-2.25 font-semibold">{product.productName}</span>
          <p className="text-gray-500">
            상품설명 디테일 상품설명 디테일 상품설명 디테일 상품설명 디테일
            <br />
            상품설명 디테일 상품설명 디테일 상품 설명 디테일
            <br />
            상품설명 디테일 상품설명 디테일 상품설명 디테일 상품설명 디테일
            상품설명 디테일 상품설명 디테일 상품 설명 디테일
          </p>
        </div>
      </div>
      <div className="relative aspect-square w-full max-w-lg col-span-6">
        <Image
          src={product.thumbnailImageUrl}
          alt={product.productName}
          fill
          sizes="30vw"
          className="relative h-full w-full object-contain"
        />
      </div>
      <div className="w-fit flex flex-col col-span-3">
        <div className="sticky top-64">
          <span className="text-0.875">Select Color</span>
          <div className="flex gap-2">
            <button className="rounded-md px-4 py-1 bg-black text-white">
              Black
            </button>
            <button className="rounded-md px-4 py-1 bg-white text-black border">
              White
            </button>
            <button className="rounded-md px-4 py-1 bg-red-500 text-white">
              Red
            </button>
          </div>
          <div className="text-1.5">₩{commaToCurrency(product.price)}</div>{' '}
        </div>
      </div>
      <div className="col-span-12 w-full h-1 bg-black mt-14" />
      <ProductNavigation id="product-info" />
      <div className="relative aspect-square w-full col-span-12">
        <Image
          src={product.thumbnailImageUrl}
          alt={product.productName}
          fill
          sizes="30vw"
          className="relative h-full w-full object-contain"
        />
      </div>{' '}
      <ProductNavigation id="payment-exchange-delivery-info" />
      <ProductNavigation id="product-inquiry" />
    </div>
  );
}
