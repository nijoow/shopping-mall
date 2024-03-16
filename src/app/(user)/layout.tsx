import Footer from './_components/Footer/Footer';
import Header from './_components/Header/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-full w-full flex-col">
      <Header />
      <div className="flex-auto">{children}</div>
      <Footer />
    </main>
  );
}
