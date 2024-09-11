import {
  CredentialsValidationError,
  NotCredentialsUserError,
  PasswordNotMatchedError,
  UserNotFoundError,
} from '@/lib/auth/error';
import {
  getUserByEmail,
  getUserByEmailAndProvider,
  getUserPassword,
  registerUserBySocialLogin,
} from '@/lib/database/user';
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
      async authorize(credentials) {
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

        if (account && user) {
          const existUser = await getUserByEmailAndProvider(
            user.email as string,
            account.provider,
          );
          if (existUser) return true;

          await registerUserBySocialLogin({
            email: user.email!,
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
    async jwt({ token }) {
      const user = await getUserByEmail(token.email as string);
      token.nickname = user?.nickname;
      token.name = user?.name;
      token.user_id = user?.user_id;
      return token;
    },
    async session({ session, token }) {
      if (token.nickname && session.user) {
        session.user.name = token.name as string;
        session.user.nickname = token.nickname as string;
        session.user.user_id = token.user_id as number;
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
