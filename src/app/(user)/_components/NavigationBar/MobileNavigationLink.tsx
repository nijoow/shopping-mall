import Link from 'next/link';
import { ReactNode } from 'react';

const MobileNavigationLink = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}) => (
  <Link
    href={href}
    className="group col-span-1 flex h-full flex-col items-center justify-center gap-1 px-2 py-1 hover:bg-gray-700"
  >
    {icon}
    <span className="text-0.625 transition-all">{text}</span>
  </Link>
);

export default MobileNavigationLink;
