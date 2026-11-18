import {
  fintUserByEmail,
  registerUserByCredentials,
} from '@/lib/database/user';
import * as bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { email, password, nickname } = body;
  const existEmail = await fintUserByEmail(email);

  try {
    if (existEmail) throw new Error('duplicated');
    if (!email || !password) throw new Error('email and password required');

    const hashedPassword = await bcrypt.hash(password, 10);
    await registerUserByCredentials({
      email,
      password: hashedPassword,
      nickname,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }

  return NextResponse.json({ email, password, nickname });
}
