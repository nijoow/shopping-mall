import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/lib/react-query/ReactQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nijoow Shopping Mall',
  description: 'Shopping Mall Toy Project',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <html lang="ko" className="h-full">
        <body className={`${inter.className} relative flex h-full flex-col`}>
          {children}
        </body>
      </html>
    </ReactQueryProvider>
  );
}
