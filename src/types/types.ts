export type User = {
  id: string;
  user_id: number;
  email: string;
  name: string;
  nickname: string;
  login_provider: string;
};

export type AuthPassword = {
  user_id: number;
  password: string;
};
