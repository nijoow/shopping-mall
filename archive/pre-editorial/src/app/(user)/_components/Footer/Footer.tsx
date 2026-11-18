import Logo from '@/components/Logo';
import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/shop/all', label: 'SHOP' },
  { href: '/3d-shop', label: '3D LAB' },
  { href: '/like', label: 'LIKE' },
  { href: '/my-page', label: 'MY PAGE' },
];

const Footer = () => (
  <footer className="mb-16 w-full flex-none border-t border-border sm:mb-0">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <Logo className="text-2" />
          <p className="text-0.875 text-muted-foreground">
            STREET CASUAL SELECT SHOP — SEOUL
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="display text-0.75 tracking-widest text-muted-foreground transition-colors hover:text-volt"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-5 text-0.75 text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Lee Woo Jin. All Rights Reserved.</span>
        <span className="display tracking-widest">EST. 2024</span>
      </div>
    </div>
  </footer>
);

export default Footer;
