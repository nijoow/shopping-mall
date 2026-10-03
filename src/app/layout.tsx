import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { DemoProvider } from '@/components/commerce/DemoProvider';
import { Footer, Header } from '@/components/commerce/Header';
import './globals.css';
const body = localFont({
  src: '../fonts/NanumSquareRoundR.ttf',
  variable: '--font-body',
  display: 'swap',
});
const display = localFont({
  src: '../fonts/Anton-Regular.ttf',
  variable: '--font-display',
  display: 'swap',
});
export const metadata: Metadata = {
  title: {
    default: 'NIJOOW — A new perspective on everyday.',
    template: '%s | NIJOOW',
  },
  description:
    '스니커즈를 3D로 편집하고 나만의 디자인으로 주문 과정을 체험하세요. NIJOOW는 스니커즈 중심의 가상 편집숍입니다.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${body.variable} ${display.variable}`}
    >
      <body>
        <DemoProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </DemoProvider>
      </body>
    </html>
  );
}
