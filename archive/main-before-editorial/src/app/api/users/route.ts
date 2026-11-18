import { getUsers } from '@/lib/database/user';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await getUsers();
  const data = { rows: users.rows, rowCount: users.rowCount };

  return NextResponse.json(data);
}
