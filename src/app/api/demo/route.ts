import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/server/repository';
import { DomainError, idSchema } from '@/domain/validation';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const COOKIE = 'nijoow-demo-v2';
async function actor(request: NextRequest) {
  const repo = repository();
  return {
    repo,
    workspace: await repo.workspace(request.cookies.get(COOKIE)?.value),
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
      { error: '올바른 요청 형식이 아닙니다.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      { error: '입력값을 다시 확인해 주세요.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  if (error instanceof DomainError)
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
      },
      {
        status: error.status,
        headers: {
          'Cache-Control': 'private, no-store',
          ...(error.retryAfter
            ? { 'Retry-After': String(error.retryAfter) }
            : {}),
        },
      },
    );
  const code = (error as { code?: unknown })?.code;
  console.error(
    '[demo-api]',
    typeof code === 'string' && /^[A-Z0-9_]{1,40}$/.test(code)
      ? code
      : error instanceof Error
        ? error.name
        : 'Unknown error',
  );
  return NextResponse.json(
    {
      error: '요청을 처리하지 못했습니다. 내용을 유지한 채 다시 시도해 주세요.',
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
  try {
    const origin = request.headers.get('origin');
    const requestUrl = new URL(request.url);
    const hostOrigin = new URL(
      `${requestUrl.protocol}//${request.headers.get('host') ?? requestUrl.host}`,
    ).origin;
    const allowedOrigins = new Set([
      hostOrigin,
      process.env.NIJOOW_APP_URL?.trim()
        ? new URL(process.env.NIJOOW_APP_URL.trim()).origin
        : hostOrigin,
    ]);
    if (
      (origin && !allowedOrigins.has(origin)) ||
      request.headers.get('sec-fetch-site') === 'cross-site'
    )
      return NextResponse.json(
        { error: '허용되지 않은 요청입니다.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    if (!request.headers.get('content-type')?.includes('application/json'))
      return NextResponse.json(
        { error: 'JSON 요청이 필요합니다.', code: 'UNSUPPORTED_MEDIA_TYPE' },
        { status: 415 },
      );
    const raw = await request.text();
    if (raw.length > 200000)
      return NextResponse.json(
        { error: '요청 용량을 초과했습니다.', code: 'PAYLOAD_TOO_LARGE' },
        { status: 413 },
      );
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
          throw new DomainError(
            'CONFIRM_REQUIRED',
            '초기화 확인이 필요합니다.',
          );
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
        throw new DomainError('INVALID_OPERATION', '알 수 없는 작업입니다.');
    }
    return response(
      { state: await repo.state(workspace.id), result },
      workspace.token,
    );
  } catch (error) {
    return failure(error);
  }
}
