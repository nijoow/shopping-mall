import type { NextAuthConfig } from 'next-auth';

const authConfig = {
  providers: [],
  pages: { signIn: '/auth/login', error: '/auth/login' },
} satisfies NextAuthConfig;

export default authConfig;
