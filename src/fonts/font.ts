import localFont from 'next/font/local';

export const nanumSquareRound = localFont({
  src: [
    {
      path: './NanumSquareRoundL.ttf',
      weight: '300',
    },
    {
      path: './NanumSquareRoundR.ttf',
      weight: '400',
    },
    {
      path: './NanumSquareRoundB.ttf',
      weight: '700',
    },
    {
      path: './NanumSquareRoundEB.ttf',
      weight: '800',
    },
  ],
});

/** 스트릿 무드 디스플레이 폰트 — 헤드라인/로고/숫자 전용 */
export const outfit = localFont({
  src: [
    {
      path: './Outfit-Bold.ttf',
      weight: '700',
    },
  ],
  variable: '--font-display',
});
