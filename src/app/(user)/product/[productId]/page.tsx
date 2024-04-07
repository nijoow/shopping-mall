import { getProductByProductId } from '@/lib/database/product';
import React from 'react';
import Image from 'next/image';
import { commaToCurrency } from '@/utils/commaToCurrency';
import ProductNavigation from './_components/ProductNavigation';

export default async function ProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = await getProductByProductId(Number(productId));

  if (!product)
    return (
      <div className="flex h-full items-center justify-center">
        상품이 존재하지 않습니다.
      </div>
    );

  return (
    <div className="mx-auto grid h-fit w-full max-w-7xl grid-cols-12 justify-center gap-x-10 p-16">
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
      <div className="relative col-span-6 aspect-square w-full max-w-lg">
        <Image
          src={product.thumbnailImageUrl}
          alt={product.productName}
          fill
          sizes="30vw"
          className="relative h-full w-full object-contain"
        />
      </div>
      <div className="col-span-3 flex w-fit flex-col">
        <div className="sticky top-64">
          <span className="text-0.875">Select Color</span>
          <div className="flex gap-2">
            <button className="rounded-md bg-black px-4 py-1 text-white">
              Black
            </button>
            <button className="rounded-md border bg-white px-4 py-1 text-black">
              White
            </button>
            <button className="rounded-md bg-red-500 px-4 py-1 text-white">
              Red
            </button>
          </div>
          <div className="text-1.5">₩{commaToCurrency(product.price)}</div>{' '}
        </div>
      </div>
      <div className="col-span-12 my-12 mt-14 h-1 w-full bg-black" />
      <ProductNavigation id="product-info" />
      <div className="relative col-span-12 aspect-square w-full">
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
