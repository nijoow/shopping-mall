import { nanumSquareRound } from '@/fonts/font';
import ReactQueryProvider from '@/lib/react-query/ReactQueryProvider';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nijoow Shopping Mall',
  description: 'Shopping Mall',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <html lang="ko" className="h-full !scroll-smooth">
        <body
          className={`${nanumSquareRound.className}  relative flex h-full flex-col`}
        >
          <ThemeProvider attribute="class" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
