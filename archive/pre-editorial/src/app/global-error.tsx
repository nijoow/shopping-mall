'use client';

import { useEffect } from 'react';

/**
 * 루트 레이아웃이 렌더 중 던진 에러의 최후 방어선.
 * 자체 <html>/<body>를 가져야 하며 앱 스타일/폰트가 없을 수 있어 인라인 스타일로.
 */
export default function GlobalError({
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
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#0a0a0c',
          color: '#f4f2ec',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.02em' }}>
          NIJOOW<span style={{ color: '#d7ff00' }}>.</span>
        </h1>
        <p style={{ margin: 0, fontWeight: 700 }}>SOMETHING WENT WRONG</p>
        <p style={{ margin: 0, color: '#9a9a9f', fontSize: '0.875rem' }}>
          예기치 못한 오류가 발생했어요.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            border: 'none',
            background: '#d7ff00',
            color: '#111',
            fontWeight: 700,
            padding: '0.6rem 1.4rem',
            cursor: 'pointer',
          }}
        >
          RETRY
        </button>
      </body>
    </html>
  );
}
