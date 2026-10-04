import { Login } from '@/components/commerce/Login';
import {
  configuredSocialProviders,
  safeReturnPath,
} from '../../../../auth.providers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from 'auth';
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
  const jar = await cookies();
  let previousPath: string | undefined;
  if (params.error) {
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

  const callbackUrl = safeReturnPath(params.callbackUrl ?? previousPath);
  const hasSession = jar
    .getAll()
    .some(({ name }) =>
      ['authjs.session-token', '__Secure-authjs.session-token'].some(
        key => name === key || name.startsWith(`${key}.`),
      ),
    );
  // A replayed OAuth callback can fail after the first callback already signed in.
  // Verify the session rather than presenting a stale login error to that member.
  if (hasSession && (await auth())?.user?.id) redirect(callbackUrl);

  return (
    <Login
      callbackUrl={callbackUrl}
      enabledProviders={configuredSocialProviders()}
      errorCode={typeof params.error === 'string' ? params.error : undefined}
    />
  );
}
