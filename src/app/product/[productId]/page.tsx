import { notFound } from 'next/navigation';
import { findProduct } from '@/domain/catalog';
import { ProductDetail } from '@/components/commerce/ProductDetail';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const p = findProduct(productId);
  return {
    title: p?.name ?? '상품을 찾을 수 없어',
    description: p?.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
