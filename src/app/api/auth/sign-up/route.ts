import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { fintUserByEmail } from '@/lib/database/user';

export async function POST(request: Request) {
  const body = await request.json();

  const { email, password, name } = body;
  const existEmail = await fintUserByEmail(email);

  try {
    if (!!existEmail) throw new Error('duplicated');
    if (!email || !password) throw new Error('email and password required');

    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (email, password, name) VALUES (${email}, ${hashedPassword}, ${name});`;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }

  return NextResponse.json({ email, password, name });
}
