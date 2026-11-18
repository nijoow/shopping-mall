'use client';
import { useEffect, useState } from 'react';
import type { CommerceError } from './client-api';

export function useRetryDelay(error: CommerceError | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!error?.retryAt) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= error.retryAt!) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [error]);
  return error?.retryAt
    ? Math.max(
        0,
        Math.min(
          error.retryAfter ?? Infinity,
          Math.ceil((error.retryAt - now) / 1000),
        ),
      )
    : 0;
}
