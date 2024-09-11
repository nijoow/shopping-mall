import { GET as AuthGET, POST as AuthPOST } from 'auth';

import { naverFetchInterceptor } from '@/interceptor/naver-interceptor';
import { type NextRequest } from 'next/server';

const originalFetch = fetch;

export async function POST(req: NextRequest) {
  return AuthPOST(req);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname === '/api/auth/callback/naver') {
    global.fetch = naverFetchInterceptor(originalFetch);
    const response = await AuthGET(req);
    global.fetch = originalFetch;
    return response;
  }
  return AuthGET(req);
}
