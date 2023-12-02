export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full h-full flex flex-col">
      {children}
    </main>
  );
}
