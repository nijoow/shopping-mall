import NextAuth, { NextAuthConfig } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import {
  getUserByEmail,
  getUserByEmailAndProvider,
  getUserPassword,
  registerUserBySocialLogin,
} from '@/lib/database/user';

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

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserByEmail(email);
          if (!user) {
            throw new Error('userNotFound');
          }
          const hashedPassword = await getUserPassword(user.user_id);
          const passwordsMatch = await bcrypt.compare(password, hashedPassword);
          if (!passwordsMatch) {
            throw new Error('passwordNotMatched');
          }
          return user;
        }
        return null;
      },
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'credentials') return true;

      if (account && profile) {
        const existUser = await getUserByEmailAndProvider(
          String(profile.email),
          account.provider,
        );
        if (existUser) return true;

        await registerUserBySocialLogin({ account, profile });
      }
      return true;
    },
    async jwt({ token, account }) {
      const user = await getUserByEmail(String(token.email));
      token.nickname = user?.nickname;
      token.name = user?.name;
      return token;
    },
    async session({ session, token }) {
      if (token.name && session.user) {
        session.user.name = token.name;
        session.user.nickname = String(token.nickname);
      }
      return session;
    },
    async redirect() {
      return '/';
    },
  },
  pages: { signIn: '/auth/login' },
} satisfies NextAuthConfig);
