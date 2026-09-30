import Logo from '@/components/Logo';
import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo className="text-1.75" />
      <span className="display text-outline text-4 leading-none sm:text-5">
        404
      </span>
      <span className="display text-1.25">SOLD OUT — PAGE NOT FOUND</span>
      <p className="text-0.875 text-muted-foreground">
        찾으시는 페이지가 없거나, 이미 내려간 드롭이에요.
      </p>
      <Link
        href="/"
        className="display bg-volt px-6 py-3 text-0.875 tracking-widest text-ink transition-all hover:-translate-y-0.5 hover:shadow-street-fg"
      >
        BACK TO HOME
      </Link>
    </div>
  );
}
