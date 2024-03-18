import React from 'react';
import {
  IoHeartSharp,
  IoHome,
  IoPerson,
  IoGridSharp,
  IoAlbums,
} from 'react-icons/io5';
import MobileNavigationLink from './MobileNavigationLink';

const mobileNavigationList = [
  { href: '/', icon: <IoGridSharp size={20} />, text: 'CATEGORY' },
  { href: '/shop', icon: <IoAlbums size={20} />, text: 'SHOP' },
  { href: '/', icon: <IoHome size={20} />, text: 'HOME' },
  { href: '/like', icon: <IoHeartSharp size={20} />, text: 'MY LIKE' },
  { href: '/my-page', icon: <IoPerson size={20} />, text: 'MY PAGE' },
];

const MobileNavigationBar = () => {
  return (
    <nav className="fixed bottom-0 z-40 grid h-16 w-full grid-cols-5 bg-black px-2 text-white sm:hidden">
      {mobileNavigationList.map(({ href, icon, text }) => (
        <MobileNavigationLink key={text} href={href} icon={icon} text={text} />
      ))}
    </nav>
  );
};

export default MobileNavigationBar;
