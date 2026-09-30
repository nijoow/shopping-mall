import { auth } from 'auth';
import { redirect } from 'next/navigation';
import AddressList from './_components/AddressList';

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-border pb-5">
        <h2 className="display text-1.5 leading-tight">
          ADDRESSES<span className="text-volt">.</span>
        </h2>
        <p className="text-0.875 text-muted-foreground">
          배송지를 추가하고 관리할 수 있어요.
        </p>
      </header>
      <AddressList />
    </div>
  );
}
