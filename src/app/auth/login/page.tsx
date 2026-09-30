import { Login } from '@/components/commerce/AccountOrders';
export const metadata = { title: 'Keep your perspective' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const path = params.callbackUrl;
  return (
    <Login
      callbackUrl={
        path?.startsWith('/') && !path.startsWith('//') ? path : '/my-page'
      }
      errorCode={params.error}
    />
  );
}
