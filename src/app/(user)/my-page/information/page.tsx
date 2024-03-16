import { getUserByUserId } from '@/lib/database/user';
import { auth } from 'auth';
import { redirect } from 'next/navigation';
import React from 'react';
import ProfileName from './_components/ProfileName';
import ProfileEmail from './_components/ProfileEmail';
import ProfileNickname from './_components/ProfileNickname';
import ProfilePhoneNumber from './_components/ProfilePhoneNumber';

const Divider = () => <div className="h-0.5 w-full bg-gray-300" />;

export default async function InformationPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const user = await getUserByUserId(session?.user.user_id);

  if (!user) throw new Error('User not found');

  return (
    <>
      <h2 className="text-1.875">회원정보</h2>
      <div className="h-0.5 w-full bg-black" />
      <div className="flex w-full flex-col gap-6 py-6">
        <ProfileEmail user={user} />
        <Divider />
        <ProfileNickname user={user} />
        <Divider />
        <ProfileName user={user} />
        <Divider />
        <ProfilePhoneNumber user={user} />
      </div>
    </>
  );
}
