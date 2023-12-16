import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const body = await request.json();

  const { userId, password, name } = body;
  const duplicated = await sql`SELECT * FROM users WHERE userId = ${userId};`;

  if (duplicated)
    return NextResponse.json({ error: 'duplicated' }, { status: 400 });

  try {
    if (!userId || !password) throw new Error('userId and password required');
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (userId, password, name) VALUES (${userId}, ${hashedPassword}, ${name});`;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return Response.json({ userId, password, name });
}
