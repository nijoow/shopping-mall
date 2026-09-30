/**
 * 단일 서버리스 인스턴스 메모리 내에서만 유효한 경량 고정-윈도우 rate limiter.
 * 별도 인프라(Redis 등) 없이 브루트포스·이메일 열거를 완화하는 용도 —
 * 인스턴스가 여러 개로 스케일되면 인스턴스별로 독립적으로 카운트된다.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const checkRateLimit = (
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean => {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
};

export const getClientIp = (request: Request): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  request.headers.get('x-real-ip') ??
  'unknown';
