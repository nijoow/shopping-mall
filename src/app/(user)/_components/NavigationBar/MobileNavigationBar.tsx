import {
  IoAlbums,
  IoBag,
  IoGridSharp,
  IoHome,
  IoPerson,
} from 'react-icons/io5';
import MobileNavigationLink from './MobileNavigationLink';

const mobileNavigationList = [
  {
    href: '/category',
    icon: (
      <IoGridSharp
        size={20}
        className="color-transition fill-gray-950 dark:fill-white"
      />
    ),
    text: 'CATEGORY',
  },
  {
    href: '/shop/all',
    icon: (
      <IoAlbums
        size={20}
        className="color-transition fill-gray-950 dark:fill-white"
      />
    ),
    text: 'SHOP',
  },
  {
    href: '/',
    icon: (
      <IoHome
        size={20}
        className="color-transition fill-gray-950 dark:fill-white"
      />
    ),
    text: 'HOME',
  },
  {
    href: '/cart',
    icon: (
      <IoBag
        size={20}
        className="color-transition fill-gray-950 dark:fill-white"
      />
    ),
    text: 'CART',
  },
  {
    href: '/my-page',
    icon: (
      <IoPerson
        size={20}
        className="color-transition fill-gray-950 dark:fill-white"
      />
    ),
    text: 'MY PAGE',
  },
];

const MobileNavigationBar = () => (
  <nav className="color-transition fixed bottom-0 z-40 grid h-16 w-full grid-cols-5 border-t border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-gray-950 sm:hidden">
    {mobileNavigationList.map(({ href, icon, text }) => (
      <MobileNavigationLink key={text} href={href} icon={icon} text={text} />
    ))}
  </nav>
);

export default MobileNavigationBar;
