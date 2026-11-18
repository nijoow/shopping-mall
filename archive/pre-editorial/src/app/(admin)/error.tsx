'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="text-1.25 font-semibold">문제가 발생했습니다</span>
      <p className="text-0.875 text-gray-500">
        데이터를 불러오는 중 오류가 발생했어요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-md bg-black px-5 py-2 text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
