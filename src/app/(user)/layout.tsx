import Footer from './_components/header/Footer';
import Header from './_components/header/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-auto p-6"> {children}</div>
      <Footer />
    </main>
  );
}
