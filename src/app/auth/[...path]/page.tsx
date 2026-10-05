import { redirect } from 'next/navigation';

export const metadata = { robots: { index: false, follow: false } };

// Keep old bookmarks usable without carrying OAuth query parameters forward.
export default function Page() {
  redirect('/my-page');
}
