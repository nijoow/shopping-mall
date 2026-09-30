import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Studio } from '@/components/commerce/Studio';
import { repository } from '@/server/repository';
export const metadata = { title: 'Your personal edit — Studio' };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { model } = await params;
  if (model !== 'runner' && model !== 'low') notFound();
  const { source } = await searchParams;
  const shared = source ? await repository().shared(source) : undefined;
  if (source && (!shared || shared.config.model !== model)) notFound();
  return (
    <Suspense>
      <Studio model={model} shared={shared ?? undefined} />
    </Suspense>
  );
}
