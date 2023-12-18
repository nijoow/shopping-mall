import Footer from './_components/header/Footer';
import Header from './_components/header/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col w-full h-full">
      <Header />
      <div className="flex-auto">{children}</div>
      <Footer />
    </main>
  );
}
