import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { userId, password, name } = body;

  try {
    if (!userId || !password) throw new Error('userId and password required');
    await sql`INSERT INTO users (userId, password, name) VALUES (${userId}, ${password}, ${name});`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return Response.json({ userId, password, name });
}
