import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="display text-outline text-4 leading-none sm:text-5">
        404
      </span>
      <span className="display text-1.25">SOLD OUT — PAGE NOT FOUND</span>
      <p className="text-0.875 text-muted-foreground">
        찾으시는 페이지가 없거나, 이미 내려간 드롭이에요.
      </p>
      <Button asChild variant="volt" className="mt-2">
        <Link href="/">BACK TO HOME</Link>
      </Button>
    </div>
  );
}
