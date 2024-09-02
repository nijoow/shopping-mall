import type { NextAuthConfig } from 'next-auth';

const authConfig = {
  providers: [],
  pages: { signIn: '/auth/login' },
} satisfies NextAuthConfig;

export default authConfig;
