'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션에서는 관측 도구로 보낼 자리
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="display text-outline text-3 leading-none sm:text-4">
        OOPS
      </span>
      <span className="display text-1.25">SOMETHING WENT WRONG</span>
      <p className="max-w-md text-0.875 text-muted-foreground">
        페이지를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.
      </p>
      <Button variant="volt" className="mt-2" onClick={reset}>
        RETRY
      </Button>
    </div>
  );
}
