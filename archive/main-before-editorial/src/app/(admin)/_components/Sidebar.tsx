import Link from 'next/link';

const Sidebar = () => (
  <div className="flex h-full w-64 flex-col bg-black p-4 text-white">
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

export default Sidebar;
