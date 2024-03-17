import Footer from './_components/Footer/Footer';
import Header from './_components/Header/Header';
import MobileNavigationBar from './_components/NavigationBar/MobileNavigationBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative flex w-full flex-auto flex-col">
        <div className="flex-auto overflow-auto">{children} </div>
        <Footer />
      </main>
      <MobileNavigationBar />
    </>
  );
}
