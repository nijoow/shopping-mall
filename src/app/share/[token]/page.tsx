import { notFound } from 'next/navigation';
import { repository } from '@/server/repository';
import { SharedDesign } from '@/components/commerce/SharedDesign';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'A shared design',
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const design = await repository().shared(token);
  if (!design) notFound();
  return <SharedDesign design={design} token={token} />;
}
