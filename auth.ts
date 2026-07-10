import {
  CredentialsValidationError,
  NotCredentialsUserError,
  PasswordNotMatchedError,
  RateLimitedError,
  UserNotFoundError,
} from '@/lib/auth/error';
import {
  getUserByEmail,
  getUserPassword,
  linkOrCreateSocialUser,
} from '@/lib/database/user';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { User } from '@/types/types';
import * as bcrypt from 'bcrypt';
import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import { z } from 'zod';
import authConfig from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Sign In',
      credentials: {
        email: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials, request) {
        const ip = getClientIp(request);
        if (!checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 })) {
          throw new RateLimitedError() as Error;
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);
        if (!parsedCredentials.success) {
          throw new CredentialsValidationError() as Error;
        }

        const { email, password } = parsedCredentials.data;
        const user = await getUserByEmail(email);
        if (!user) {
          throw new UserNotFoundError() as Error;
        }

        const hashedPassword = await getUserPassword(user.user_id);
        if (!hashedPassword) {
          throw new NotCredentialsUserError() as Error;
        }

        const passwordsMatch = await bcrypt.compare(password, hashedPassword);
        if (!passwordsMatch) {
          throw new PasswordNotMatchedError() as Error;
        }

        return user as User;
      },
    }),
    Kakao,
    Naver,
    Google,
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'credentials') return true;

        // 소셜 로그인은 이메일 기준으로 기존 계정에 연결(없으면 생성)
        if (account && user?.email) {
          await linkOrCreateSocialUser({
            email: user.email,
            name: user.name,
            accountId: account.providerAccountId,
            provider: account.provider,
          });
        }
        return true;
      } catch (error) {
        return `/auth/login?error=${encodeURIComponent((error as Error).message)}`;
      }
    },
    async jwt({ token, user, trigger }) {
      // user_id 는 불변이고, 프로필 표시는 각 페이지가 getUserByUserId 로
      // 직접 조회하므로 매 요청마다 DB를 조회할 필요가 없다.
      // 로그인(user)·명시적 세션 갱신(update)·필수 클레임이 비어있는 토큰일
      // 때만 조회한다. role 이 없는 (role 도입 이전 발급된) 토큰도 self-heal.
      if (
        user ||
        trigger === 'update' ||
        token.user_id === undefined ||
        token.role === undefined
      ) {
        const dbUser = await getUserByEmail((user?.email ?? token.email) as string);
        token.nickname = dbUser?.nickname;
        token.name = dbUser?.name;
        token.user_id = dbUser?.user_id;
        token.role = dbUser?.role;
      }
      return token;
    },
    async session({ session, token }) {
      // identity 는 user_id 로 판정한다 (nickname 은 소셜 계정에서 null 일 수 있음)
      if (token.user_id && session.user) {
        session.user.name = token.name as string;
        session.user.nickname = token.nickname as string;
        session.user.user_id = token.user_id as number;
        session.user.role = token.role as 'ADMIN' | 'USER';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
} satisfies NextAuthConfig);

export const { GET, POST } = handlers;
