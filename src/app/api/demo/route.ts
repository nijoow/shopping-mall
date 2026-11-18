import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { repository } from '@/server/repository';
import { DomainError, idSchema } from '@/domain/validation';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const COOKIE = 'nijoow-demo-v2';
async function actor(request: NextRequest) {
  const hasMemberSession = request.cookies
    .getAll()
    .some(cookie =>
      ['authjs.session-token', '__Secure-authjs.session-token'].some(
        name => cookie.name === name || cookie.name.startsWith(`${name}.`),
      ),
    );
  const session = hasMemberSession ? await auth() : null;
  const repo = repository();
  return {
    repo,
    workspace: await repo.workspace(
      request.cookies.get(COOKIE)?.value,
      session?.user?.id,
    ),
  };
}
function response(data: unknown, token: string) {
  const result = NextResponse.json(data, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
  result.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 86400,
    path: '/',
  });
  return result;
}
function failure(error: unknown) {
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: '올바른 요청 형식이 아니야.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      { error: '입력값을 다시 확인해줘.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  if (error instanceof DomainError)
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  console.error(
    '[demo-api]',
    error instanceof Error ? error.message : 'Unknown error',
  );
  return NextResponse.json(
    {
      error: '요청을 처리하지 못했어. 내용을 유지한 채 다시 시도해줘.',
      code: 'UNAVAILABLE',
    },
    { status: 500 },
  );
}
export async function GET(request: NextRequest) {
  try {
    const { repo, workspace } = await actor(request);
    return response({ state: await repo.state(workspace.id) }, workspace.token);
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const hostOrigin = new URL(
    `${requestUrl.protocol}//${request.headers.get('host') ?? requestUrl.host}`,
  ).origin;
  const allowedOrigins = new Set([
    hostOrigin,
    process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : hostOrigin,
  ]);
  if (
    (origin && !allowedOrigins.has(origin)) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return NextResponse.json(
      { error: '허용되지 않은 요청이야.' },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'JSON 요청이 필요해.' }, { status: 415 });
  try {
    const raw = await request.text();
    if (raw.length > 200000)
      return NextResponse.json({ error: '요청이 너무 커.' }, { status: 413 });
    const body = z
      .object({ op: z.string(), data: z.unknown().optional() })
      .strict()
      .parse(JSON.parse(raw));
    const { repo, workspace } = await actor(request);
    let result: unknown = null;
    switch (body.op) {
      case 'cart.add':
        result = { lineId: await repo.addCart(workspace.id, body.data) };
        break;
      case 'cart.replace': {
        const d = z
          .object({ id: idSchema, changes: z.unknown() })
          .strict()
          .parse(body.data);
        result = {
          lineId: await repo.replaceCart(workspace.id, d.id, d.changes),
        };
        break;
      }
      case 'cart.quantity': {
        const d = z
          .object({ id: idSchema, quantity: z.number() })
          .strict()
          .parse(body.data);
        await repo.changeQuantity(workspace.id, d.id, d.quantity);
        break;
      }
      case 'cart.remove':
        await repo.removeCart(workspace.id, idSchema.parse(body.data));
        break;
      case 'favorite':
        await repo.favorite(workspace.id, idSchema.parse(body.data));
        break;
      case 'design.save':
        result = await repo.saveDesign(workspace.id, body.data);
        break;
      case 'design.delete':
        await repo.deleteDesign(workspace.id, idSchema.parse(body.data));
        break;
      case 'design.share':
        result = {
          token: await repo.share(workspace.id, idSchema.parse(body.data)),
        };
        break;
      case 'checkout':
        result = await repo.checkout(workspace.id, body.data);
        if ((body.data as { scenario?: string })?.scenario === 'delayed')
          await new Promise(resolve => setTimeout(resolve, 1800));
        break;
      case 'orders.reset':
        if (body.data !== 'CONFIRM_RESET')
          throw new DomainError('CONFIRM_REQUIRED', '초기화 확인이 필요해.');
        await repo.resetOrders(workspace.id);
        break;
      case 'order.advance': {
        const d = z
          .object({
            id: idSchema,
            status: z.enum([
              'PREPARING',
              'SHIPPED',
              'DELIVERED',
              'CANCELLED',
              'RETURN_REQUESTED',
              'REFUNDED',
            ]),
          })
          .strict()
          .parse(body.data);
        result = await repo.advanceOrder(workspace.id, d.id, d.status);
        break;
      }
      default:
        throw new DomainError('INVALID_OPERATION', '알 수 없는 작업이야.');
    }
    return response(
      { state: await repo.state(workspace.id), result },
      workspace.token,
    );
  } catch (error) {
    return failure(error);
  }
}
