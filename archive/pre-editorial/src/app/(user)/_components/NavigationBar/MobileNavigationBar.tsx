import {
  IoAlbumsOutline,
  IoBagOutline,
  IoCubeOutline,
  IoHomeOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import MobileNavigationLink from './MobileNavigationLink';

const mobileNavigationList = [
  {
    href: '/3d-shop',
    icon: <IoCubeOutline size={20} />,
    text: '3D LAB',
  },
  {
    href: '/shop/all',
    icon: <IoAlbumsOutline size={20} />,
    text: 'SHOP',
  },
  {
    href: '/',
    icon: <IoHomeOutline size={20} />,
    text: 'HOME',
  },
  {
    href: '/cart',
    icon: <IoBagOutline size={20} />,
    text: 'CART',
  },
  {
    href: '/my-page',
    icon: <IoPersonOutline size={20} />,
    text: 'MY PAGE',
  },
];

const MobileNavigationBar = () => (
  <nav className="fixed bottom-0 z-40 grid h-16 w-full grid-cols-5 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
    {mobileNavigationList.map(({ href, icon, text }) => (
      <MobileNavigationLink key={text} href={href} icon={icon} text={text} />
    ))}
  </nav>
);

export default MobileNavigationBar;
