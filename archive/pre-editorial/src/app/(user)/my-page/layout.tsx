import React from 'react';
import MyPageNav from './_components/MyPageNav';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:gap-0 sm:px-8 sm:py-16">
    <aside className="flex w-full flex-col gap-6 sm:w-64 sm:shrink-0 sm:pr-10">
      <h1 className="display text-1.75 leading-none">
        MY PAGE<span className="text-volt">.</span>
      </h1>
      <MyPageNav />
    </aside>
    <div className="flex w-full min-w-0 flex-col">{children}</div>
  </div>
);

export default Layout;
