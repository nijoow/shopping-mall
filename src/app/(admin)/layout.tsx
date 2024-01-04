import Sidebar from './_components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex w-full h-full">
      <Sidebar />
      <div className="p-4 flex flex-col flex-auto h-full bg-gray-100">
        {children}
      </div>
    </main>
  );
}
