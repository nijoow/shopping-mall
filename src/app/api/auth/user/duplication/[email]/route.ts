import { fintUserByEmail } from '@/lib/database/user';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } },
) {
  const email = params.email;
  const existEmail = await fintUserByEmail(email);

  const data = { isDuplicated: !!existEmail };

  return NextResponse.json(data);
}
