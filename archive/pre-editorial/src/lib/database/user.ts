import { AuthPassword, User } from '@/types/types';
import { sql } from '@vercel/postgres';

export const fintUserByEmail = async (email: string) => {
  const user = await sql`SELECT * FROM users WHERE email = ${email}`;

  return user.rows[0];
};

export const getUsers = async () => sql<User>`SELECT * FROM users`;

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email = ${email}`;
    return user.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user by email.');
  }
};

export const getUserPassword = async (userId: number): Promise<string> => {
  try {
    const password =
      await sql<AuthPassword>`SELECT password FROM credentials WHERE user_id = ${userId}`;

    return password.rows[0]?.password;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user password.');
  }
};

/**
 * 소셜 로그인 처리 — 이메일 기준으로 기존 계정에 연결한다.
 * 같은 이메일 계정이 이미 있으면(다른 provider나 credentials 포함) users 행을
 * 새로 만들지 않고 social_logins 만 붙인다. 없을 때만 새 계정을 생성한다.
 * (OAuth 제공자가 이메일을 검증했다는 전제 — Google/Naver/Kakao 모두 해당)
 */
export const linkOrCreateSocialUser = async ({
  email,
  name,
  accountId,
  provider,
}: {
  email: string;
  name?: string | null;
  accountId?: string | null;
  provider: string;
}): Promise<void> => {
  const existing = await getUserByEmail(email);

  if (existing) {
    // 이미 있는 계정에 이 provider 소셜 로그인을 연결(중복 방지)
    await sql`
      INSERT INTO social_logins (user_id, account_id, type)
      SELECT ${existing.user_id}, ${accountId}, ${provider}
      WHERE NOT EXISTS (
        SELECT 1 FROM social_logins
        WHERE user_id = ${existing.user_id} AND type = ${provider}
      )`;
    return;
  }

  const result = await sql`
    INSERT INTO users (email, login_provider, name, nickname)
    VALUES (${email}, 'SOCIAL_LOGIN', ${name}, ${name})
    RETURNING user_id`;
  const userId = result.rows[0].user_id;
  await sql`
    INSERT INTO social_logins (user_id, account_id, type)
    VALUES (${userId}, ${accountId}, ${provider})`;
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
    console.error(error);
    throw new Error('Failed to fetch user by id.');
  }
};

/** 사용자가 직접 수정할 수 있는 컬럼 화이트리스트 */
export const UPDATABLE_USER_COLUMNS = [
  'name',
  'nickname',
  'phone_number',
] as const;

export type UpdatableUserColumn = (typeof UPDATABLE_USER_COLUMNS)[number];

export const updateUserInformation = async (
  userId: number,
  targets: Partial<Record<UpdatableUserColumn, string>>,
) => {
  const entries = UPDATABLE_USER_COLUMNS.flatMap(column =>
    targets[column] !== undefined
      ? [[column, targets[column]] as const]
      : [],
  );

  if (entries.length === 0) return;

  const setClause = entries
    .map(([column], index) => `${column} = $${index + 2}`)
    .join(', ');

  try {
    await sql.query(`UPDATE users SET ${setClause} WHERE user_id = $1`, [
      userId,
      ...entries.map(([, value]) => value),
    ]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update user information.');
  }
};
