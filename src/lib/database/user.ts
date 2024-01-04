import { User } from '@/types/types';
import { sql } from '@vercel/postgres';

export const fintUserByEmail = async (email: string) => {
  const user = await sql`SELECT * FROM member_users WHERE email = ${email}`;

  return user.rows[0];
};

export const getUsers = async () => {
  return await sql<User>`SELECT * FROM member_users`;
};
