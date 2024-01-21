import NextAuth from 'next-auth';

declare module 'next-auth' {
  export interface User {
    user_id: number;
    email: string;
    nickname: string;
    name: string | null;
  }

  interface Session {
    user: User;
  }
}
