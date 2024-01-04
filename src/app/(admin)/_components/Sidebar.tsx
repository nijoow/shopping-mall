import Link from 'next/link';
import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-black text-white p-4 flex flex-col">
      <Link href="/admin/dashboard" className="px-2 py-1.5">
        dashboard
      </Link>
      <Link href="/admin/users" className="px-2 py-1.5">
        users
      </Link>
      <Link href="/admin/products" className="px-2 py-1.5">
        products
      </Link>
    </div>
  );
};

export default Sidebar;
