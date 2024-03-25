import Link from 'next/link';
import FilterDrawer from './_components/FilterDrawer';
import Filter from './_components/Filter';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col py-4 sm:flex-row sm:p-8">
      <div className="flex h-full w-full flex-col gap-2 sm:w-64 sm:gap-8 sm:pr-4">
        <span className="pl-4 text-1.5 font-semibold sm:pl-0">SHOP</span>
        <div className="flex w-full flex-row gap-2 overflow-x-auto sm:flex-col sm:gap-0">
          {['ALL', 'OUTER', 'TOP', 'BOTTOM', 'SHOES', 'ACC'].map(category => (
            <Link
              href={category.toLocaleLowerCase()}
              key={category}
              className="my-1.5 px-2 font-light text-gray-500"
            >
              {category}
            </Link>
          ))}
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          <Filter />
        </div>
        <FilterDrawer />
      </div>
      {children}
    </div>
  );
}
