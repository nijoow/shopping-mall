import { fintUserByEmail } from '@/lib/database/user';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } },
) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`dup:${ip}`, { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 },
    );
  }

  const { email } = params;
  const existEmail = await fintUserByEmail(email);

  const data = { isDuplicated: !!existEmail };

  return NextResponse.json(data);
}
