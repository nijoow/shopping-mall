import { sql } from '@vercel/postgres';

export const fintUserByEmail = async (email: string) => {
  const user = await sql`SELECT * FROM member_users WHERE email = ${email}`;

  return user.rows[0];
};
