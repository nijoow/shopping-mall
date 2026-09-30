import NextAuth, { customFetch } from 'next-auth';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import { repository } from '@/server/repository';

const naverFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  const url = new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
  );
  if (
    response.ok &&
    url.hostname === 'nid.naver.com' &&
    url.pathname === '/oauth2.0/token'
  ) {
    const data = await response.clone().json();
    if (typeof data.expires_in === 'string') {
      data.expires_in = Number(data.expires_in);
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  }
  return response;
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost:
    process.env.AUTH_TRUST_HOST === 'true' ||
    process.env.NODE_ENV === 'development' ||
    Boolean(process.env.VERCEL),
  providers: [Kakao, Naver({ [customFetch]: naverFetch }), Google],
  pages: { signIn: '/auth/login', error: '/auth/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.sub = await repository().account(
          account.provider,
          account.providerAccountId,
          user.name ?? 'NIJOOW 멤버',
        );
      } else if (
        token.sub &&
        !(await repository().row(
          'SELECT id FROM accounts WHERE id=?',
          token.sub,
        ))
      ) {
        // A token from the archived implementation does not identify a new local account.
        return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const target = new URL(url, baseUrl);
      return target.origin === new URL(baseUrl).origin ? target.href : baseUrl;
    },
  },
});
