import Sidebar from './_components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-full w-full">
      <Sidebar />
      <div className="flex h-full flex-auto flex-col bg-gray-100 p-4">
        {children}
      </div>
    </main>
  );
}
