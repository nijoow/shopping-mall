import { getUserByUserId } from '@/lib/database/user';
import { User } from '@/types/types';
import { auth } from 'auth';
import { redirect } from 'next/navigation';
import React from 'react';

const getProfileCompletion = (user: User) => {
  const count = [
    user.email,
    user.name,
    user.nickname,
    user.phone_number,
    user.birth,
    user.gender,
  ].reduce((count, value) => (!!value ? count + 1 : count), 0);

  return ((count / 6) * 100).toFixed(1);
};

export default async function MyPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const user = await getUserByUserId(session?.user.user_id);

  if (!user) throw new Error('User not found');

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-2">{user.name}님</span>
        <span>
          Signed in as : <span className="font-semibold">{user?.email}</span>
        </span>
      </div>
      <div className="my-2 h-0.5 w-full bg-black" />
      <div className="my-8 flex gap-12">
        <div className="flex flex-col gap-4">
          <span className="font-semibold">Profile</span>
          <div className="flex items-end gap-2">
            <span className="text-1.875 font-semibold leading-none">
              {getProfileCompletion(user)}%
            </span>
            <span className="uppercase">Completed</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-semibold">Addresses</span>
          <div className="flex items-end gap-2">
            <span className="text-1.875 font-semibold leading-none">{0}</span>
            <span className="uppercase">Saved</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-semibold">Recent Orders</span>
        <div className="flex items-end gap-2">
          <span>No recent orders</span>
        </div>
      </div>
    </>
  );
}
