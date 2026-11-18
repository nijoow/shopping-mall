import { getUsers } from '@/lib/database/user';
import { auth } from 'auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (session?.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const users = await getUsers();
  const data = { rows: users.rows, rowCount: users.rowCount };

  return NextResponse.json(data);
}
