import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  pages: { signIn: '/auth/login' },
} satisfies NextAuthConfig;
