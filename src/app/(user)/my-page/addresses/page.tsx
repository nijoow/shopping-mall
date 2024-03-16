import { getUserByUserId } from '@/lib/database/user';
import { auth } from 'auth';
import { redirect } from 'next/navigation';
import React from 'react';
import AddressList from './_components.tsx/AddressList';

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const user = await getUserByUserId(session?.user.user_id);

  if (!user) throw new Error('User not found');

  return (
    <>
      <h2 className="text-1.875">배송지 정보</h2>
      <div className="h-0.5 w-full bg-black" />
      <div className="flex w-full flex-col gap-6 py-6">
        <AddressList user={session.user} />
      </div>
    </>
  );
}
