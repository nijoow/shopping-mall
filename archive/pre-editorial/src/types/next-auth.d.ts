import 'next-auth';

declare module 'next-auth' {
  export interface User {
    user_id: number;
    email: string;
    nickname: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
  }

  interface Session {
    user: User;
  }
}
