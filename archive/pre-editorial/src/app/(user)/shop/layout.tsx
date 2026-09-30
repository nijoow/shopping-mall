import { Suspense } from 'react';
import CategoryNav from './_components/CategoryNav';
import Filter from './_components/Filter';
import FilterDrawer from './_components/FilterDrawer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4">
        <h1 className="display text-2 leading-none">
          SHOP<span className="text-volt">.</span>
        </h1>
        <div className="flex items-center justify-between gap-3">
          {/* useSearchParams를 쓰는 클라이언트 컴포넌트는 Suspense로 감싼다 */}
          <Suspense>
            <CategoryNav />
          </Suspense>
          <Suspense>
            <FilterDrawer />
          </Suspense>
        </div>
      </header>

      <div className="flex w-full flex-col gap-6 lg:flex-row">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 flex flex-col gap-2.5">
            <Suspense>
              <Filter />
            </Suspense>
          </div>
        </aside>
        <div className="w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
