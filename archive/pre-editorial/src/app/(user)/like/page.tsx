import { Metadata } from 'next';
import FavoriteProducts from './_components/FavoriteProducts';

export const metadata: Metadata = { title: 'Like' };

export default function LikePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="display text-1.75 leading-none">
          LIKE<span className="text-neon-pink">♥</span>
        </h1>
        <p className="text-0.875 text-muted-foreground">
          찜해둔 아이템을 한눈에 모아봤어요.
        </p>
      </header>
      <FavoriteProducts />
    </div>
  );
}
