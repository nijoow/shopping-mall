import { AuthPassword, User } from '@/types/types';
import { sql } from '@vercel/postgres';
import { Account, Profile } from 'next-auth';

export const fintUserByEmail = async (email: string) => {
  const user = await sql`SELECT * FROM users WHERE email = ${email}`;

  return user.rows[0];
};

export const getUsers = async () => {
  return await sql<User>`SELECT * FROM users`;
};

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email = ${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
};

export const getUserByEmailAndProvider = async (
  email: string,
  provider: string,
): Promise<User | undefined> => {
  try {
    const user =
      await sql<User>`SELECT users.user_id, users.email, social_logins.type FROM users
        INNER JOIN social_logins ON users.user_id=social_logins.user_id
        WHERE users.email = ${email} AND social_logins.type = ${provider}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
};

export const getUserPassword = async (userId: number): Promise<string> => {
  try {
    const password =
      await sql<AuthPassword>`SELECT password FROM credentials WHERE user_id = ${userId}`;
    return password.rows[0].password;
  } catch (error) {
    console.error('Failed to fetch password:', error);
    throw new Error('Failed to fetch password.');
  }
};

export const registerUserBySocialLogin = async ({
  account,
  profile,
}: {
  account: Account;
  profile: Profile;
}) => {
  const result =
    await sql`INSERT INTO users (email, login_provider, name, nickname)
      VALUES (${profile.email}, 'SOCIAL_LOGIN', ${profile.name}, ${profile.name}) 
      RETURNING user_id;`;
  const userId = result.rows[0].user_id;
  await sql`INSERT INTO social_logins (user_id, account_id, type) 
    VALUES (${userId}, ${account.providerAccountId}, ${account.provider});`;
};

export const registerUserByCredentials = async ({
  nickname,
  email,
  password,
}: {
  nickname: string;
  email: string;
  password: string;
}) => {
  const result = await sql`INSERT INTO users (nickname, email, login_provider) 
    VALUES (${nickname}, ${email}, 'Credentials') 
    RETURNING user_id;`;
  const userId = result.rows[0].user_id;
  await sql`INSERT INTO credentials (user_id, password) 
    VALUES (${userId}, ${password});`;
};

export const getUserByUserId = async (
  user_id: number,
): Promise<User | undefined> => {
  try {
    const user =
      await sql<User>`SELECT * FROM users WHERE user_id = ${user_id}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
};
