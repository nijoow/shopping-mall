import { Login } from '@/components/commerce/Login';
import {
  configuredSocialProviders,
  safeReturnPath,
} from '../../../../auth.providers';
import { cookies } from 'next/headers';
export const metadata = { title: 'Keep your perspective' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  let previousPath: string | undefined;
  if (params.error) {
    const jar = await cookies();
    const previous =
      jar.get('__Secure-authjs.callback-url')?.value ??
      jar.get('authjs.callback-url')?.value;
    if (previous) {
      try {
        const url = new URL(previous);
        previousPath = url.pathname + url.search + url.hash;
      } catch {
        previousPath = previous;
      }
    }
  }

  return (
    <Login
      callbackUrl={safeReturnPath(params.callbackUrl ?? previousPath)}
      enabledProviders={configuredSocialProviders()}
      errorCode={typeof params.error === 'string' ? params.error : undefined}
    />
  );
}
