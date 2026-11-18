import { cache } from 'react';
import { notFound } from 'next/navigation';
import { repository } from '@/server/repository';
import { SharedDesign } from '@/components/commerce/SharedDesign';
export const dynamic = 'force-dynamic';
const sharedDesign = cache((token: string) => repository().shared(token));
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const design = await sharedDesign(token);
  return {
    title: design ? `${design.name} — Shared edit` : '공유 디자인',
    description: design
      ? '공유된 스니커즈 디자인을 확인하고 나만의 사본으로 편집할 수 있습니다.'
      : '공유 링크의 유효기간이 만료되었습니다.',
    robots: { index: false, follow: false },
    openGraph: {
      title: design?.name ?? 'NIJOOW — Shared edit',
      description:
        '나만의 스니커즈 디자인. 실제 결제와 배송이 없는 포트폴리오 체험입니다.',
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const design = await sharedDesign(token);
  if (!design) notFound();
  return <SharedDesign design={design} token={token} />;
}
