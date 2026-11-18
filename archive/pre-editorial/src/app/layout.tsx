import { nanumSquareRound, outfit } from '@/fonts/font';
import ReactQueryProvider from '@/lib/react-query/ReactQueryProvider';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NIJOOW — Street Casual Shop',
    template: '%s | NIJOOW',
  },
  description:
    '스트릿캐쥬얼 셀렉트샵 NIJOOW. 3D 커스터마이저로 나만의 스니커즈를 만들어 보세요.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <html lang="ko" className="h-full !scroll-smooth">
        <body
          className={`${nanumSquareRound.className} ${outfit.variable} relative flex h-full flex-col`}
        >
          {children}
        </body>
      </html>
    </ReactQueryProvider>
  );
}
