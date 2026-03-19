import { Button } from '@/components/ui/button';
import { SAMPLE_TEXT } from '@/constant/sampleText';
import { getProductByProductId } from '@/lib/database/product';
import { commaToCurrency } from '@/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import FavoriteButton from './_components/FavoriteButton';
import ProductNavigation from './_components/ProductNavigation';

const Product3DViewer = dynamic(() => import('@/components/Product3DViewer'), {
  ssr: false,
});

export default async function ProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = (await getProductByProductId([Number(productId)]))?.[0];

  if (!product)
    return (
      <div className="flex h-full items-center justify-center">
        상품이 존재하지 않습니다.
      </div>
    );

  // Mock images for demonstration if productId is 60 or 61 (example real IDs)
  let displayImage = product.imageUrl;
  if (Number(productId) === 60) {
    displayImage = '/images/sneaker.png';
  } else if (Number(productId) === 61) {
    displayImage = '/images/hoodie.png';
  }

  return (
    <div className="mx-auto grid h-fit w-full max-w-7xl grid-cols-10 justify-center p-2 sm:p-16">
      <section className="relative col-span-10 mx-auto aspect-square w-full max-w-lg lg:order-2 lg:col-span-4">
        <Image
          src={displayImage}
          alt={product.productName}
          fill
          sizes="30vw"
          className="relative h-full w-full object-contain"
        />
      </section>
      <section className="col-span-10 flex flex-col lg:order-1 lg:col-span-3">
        <div className="sticky top-48">
          <span className="text-2.25 font-semibold">{product.productName}</span>
          <p className="text-gray-500">{SAMPLE_TEXT}</p>
        </div>
      </section>
      <section className="relative order-3 col-span-10 mx-auto w-full lg:col-span-3">
        <FavoriteButton productId={product.productId} />
        <div className="sticky top-64 flex flex-col gap-2">
          <span className="text-0.875">Select Color</span>
          <div className="flex gap-2">
            {product.colors.map(color => (
              <button
                key={color}
                type="button"
                className="h-8 w-8 rounded-md text-white"
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
          <div className="text-1.5">₩{commaToCurrency(product.price)}</div>{' '}
          <Button className="w-full">Add to Cart</Button>
          <Button className="w-full">Buy Now</Button>
        </div>
      </section>

      {/* 3D Viewer Section */}
      <div className="order-3 col-span-10 my-12 mt-14">
        <h3 className="mb-4 text-1.25 font-bold">3D View (Beta)</h3>
        <Product3DViewer />
        <p className="mt-2 text-sm text-gray-500">
          * 3D 애셋을 업로드하면 이곳에서 인터랙티브하게 확인할 수 있습니다.
        </p>
      </div>

      <div className="order-3 col-span-10 my-12 mt-14 h-1 w-full bg-black/10" />
      <ProductNavigation id="product-info" />
      <section className="relative order-3 col-span-10 aspect-square w-full">
        <Image
          src={displayImage}
          alt={product.productName}
          fill
          sizes="30vw"
          className="relative h-full w-full object-contain"
          priority
        />
      </section>{' '}
      <ProductNavigation id="payment-exchange-delivery-info" />
      <section className="order-3 col-span-10 my-8 w-full">
        {SAMPLE_TEXT}
        <br />
        <br />
        {SAMPLE_TEXT}
        <br />
        <br />
        {SAMPLE_TEXT}
      </section>
      <ProductNavigation id="product-inquiry" />
    </div>
  );
}
