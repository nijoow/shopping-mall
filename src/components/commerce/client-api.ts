import type { DemoState } from '../../domain/types';

const fallback =
  '요청을 처리하지 못했습니다. 입력한 내용을 유지한 채 다시 시도해 주세요.';

export class CommerceError extends Error {
  public retryAt?: number;
  constructor(
    message: string,
    public code = 'UNAVAILABLE',
    public status = 0,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'CommerceError';
    this.retryAt = retryAfter ? Date.now() + retryAfter * 1000 : undefined;
  }
}

export function commerceError(error: unknown): CommerceError {
  return error instanceof CommerceError ? error : new CommerceError(fallback);
}

export function errorMessage(error: unknown): string {
  const failure = commerceError(error);
  return failure.retryAfter
    ? `${failure.message} ${failure.retryAfter}초 후 다시 시도해 주세요.`
    : failure.message;
}

type DemoResponse<T> = { state: DemoState; result: T };

export async function demoRequest<T = unknown>(
  init?: RequestInit,
): Promise<DemoResponse<T>> {
  let response: Response;
  try {
    response = await fetch('/api/demo', init);
  } catch {
    throw new CommerceError(fallback, 'NETWORK_ERROR');
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    const delay = Number(response.headers.get('Retry-After'));
    throw new CommerceError(
      fallback,
      response.status === 429 ? 'RATE_LIMITED' : 'INVALID_RESPONSE',
      response.status,
      Number.isFinite(delay) && delay > 0 ? Math.ceil(delay) : undefined,
    );
  }
  const body =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};
  if (!response.ok) {
    const delay = Number(
      body.retryAfter ?? response.headers.get('Retry-After'),
    );
    throw new CommerceError(
      typeof body.error === 'string' ? body.error : fallback,
      typeof body.code === 'string' ? body.code : 'UNAVAILABLE',
      response.status,
      Number.isFinite(delay) && delay > 0 ? Math.ceil(delay) : undefined,
    );
  }
  const state = body.state as DemoState | undefined;
  if (
    !state ||
    typeof state.workspaceId !== 'string' ||
    !Array.isArray(state.designs) ||
    !Array.isArray(state.cart) ||
    !Array.isArray(state.orders) ||
    !Array.isArray(state.favorites) ||
    (init?.method === 'POST' && !Object.hasOwn(body, 'result'))
  ) {
    throw new CommerceError(fallback, 'INVALID_RESPONSE', response.status);
  }
  return body as DemoResponse<T>;
}
