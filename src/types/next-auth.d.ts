import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      user_id: number;
      name: string;
      email: string;
      nickname: string;
    };
  }
}
