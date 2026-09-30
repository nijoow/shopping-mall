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
