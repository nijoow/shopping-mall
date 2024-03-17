import Footer from './_components/Footer/Footer';
import Header from './_components/Header/Header';
import MobileNavigationBar from './_components/NavigationBar/MobileNavigationBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex h-full w-full flex-col overflow-auto">
      <Header />
      <div className="flex-auto">{children}</div>
      <Footer />
      <MobileNavigationBar />
    </main>
  );
}
