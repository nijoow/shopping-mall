import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Shop } from '@/components/commerce/Shop';
export const metadata = { title: 'The collection' };
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!['all', 'sneakers', 'clothing', 'accessories'].includes(category))
    notFound();
  return (
    <Suspense>
      <Shop category={category} />
    </Suspense>
  );
}
