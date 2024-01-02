import NextAuth, { NextAuthConfig } from 'next-auth';
import { AuthPassword, User } from '@/types/types';
import { sql } from '@vercel/postgres';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user =
      await sql<User>`SELECT * FROM member_users WHERE email = ${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function getUserByEmailAndProvider(
  email: string,
  provider: string,
): Promise<User | undefined> {
  try {
    const user =
      await sql<User>`SELECT * FROM member_users WHERE email = ${email} and login_provider = ${provider}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function getUserPassword(userId: number): Promise<string> {
  try {
    const password =
      await sql<AuthPassword>`SELECT password FROM auth_credentials WHERE user_id = ${userId}`;
    return password.rows[0].password;
  } catch (error) {
    console.error('Failed to fetch password:', error);
    throw new Error('Failed to fetch password.');
  }
}

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

        const result =
          await sql`INSERT INTO member_users (username, email, login_provider) VALUES (${profile.name}, ${profile.email}, ${account.provider}) RETURNING user_id;`;
        const userId = result.rows[0].user_id;
        await sql`INSERT INTO auth_social_logins (user_id, account_id, type, access_token) VALUES (${userId}, ${account.providerAccountId}, ${account.provider}, ${account.access_token});`;
      }
      return true;
    },
    async jwt({ token, account }) {
      const user = await getUserByEmail(String(token.email));
      token.name = user?.username;

      return token;
    },
    async session({ session, token }) {
      if (token.name && session.user) {
        session.user.name = token.name;
      }

      return session;
    },
    async redirect() {
      return '/';
    },
  },
  pages: { signIn: '/auth/login' },
} satisfies NextAuthConfig);
