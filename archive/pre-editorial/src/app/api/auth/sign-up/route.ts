import {
  fintUserByEmail,
  registerUserByCredentials,
} from '@/lib/database/user';
import * as bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** 클라이언트(sign-up/page.tsx)와 동일한 정책 — 서버에서 재검증한다 */
const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, '대문자를 포함해야 합니다.')
    .regex(/[a-z]/, '소문자를 포함해야 합니다.')
    .regex(/\d/, '숫자를 포함해야 합니다.')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 포함해야 합니다.'),
  nickname: z.string().trim().min(1).max(50),
});

export async function POST(request: Request) {
  const parsed = signUpSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { message: '입력값을 확인해주세요.' },
      { status: 400 },
    );
  }

  const { email, password, nickname } = parsed.data;

  const existingUser = await fintUserByEmail(email);
  if (existingUser) {
    return NextResponse.json(
      { message: '이미 가입되어있는 이메일입니다.' },
      { status: 409 },
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await registerUserByCredentials({ email, password: hashedPassword, nickname });
  } catch (error) {
    return NextResponse.json(
      { message: '회원가입에 실패했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'SUCCESS' });
}
