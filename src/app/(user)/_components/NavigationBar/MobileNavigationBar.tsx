import {
  IoAlbums,
  IoBag,
  IoGridSharp,
  IoHome,
  IoPerson,
} from 'react-icons/io5';
import MobileNavigationLink from './MobileNavigationLink';

const mobileNavigationList = [
  { href: '/category', icon: <IoGridSharp size={20} />, text: 'CATEGORY' },
  { href: '/shop/all', icon: <IoAlbums size={20} />, text: 'SHOP' },
  { href: '/', icon: <IoHome size={20} />, text: 'HOME' },
  { href: '/cart', icon: <IoBag size={20} />, text: 'CART' },
  { href: '/my-page', icon: <IoPerson size={20} />, text: 'MY PAGE' },
];

const MobileNavigationBar = () => (
  <nav className="fixed bottom-0 z-40 grid h-16 w-full grid-cols-5 bg-black px-2 text-white sm:hidden">
    {mobileNavigationList.map(({ href, icon, text }) => (
      <MobileNavigationLink key={text} href={href} icon={icon} text={text} />
    ))}
  </nav>
);

export default MobileNavigationBar;
