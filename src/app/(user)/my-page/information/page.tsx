import { getUserByUserId } from '@/lib/database/user';
import { auth } from 'auth';
import { redirect } from 'next/navigation';
import React from 'react';
import ProfileName from './_compontents/ProfileName';
import ProfileEmail from './_compontents/ProfileEmail';
import ProfileNickname from './_compontents/ProfileNickname';
import ProfilePhoneNumber from './_compontents/ProfilePhoneNumber';

const Divider = () => <div className="w-full h-0.5 bg-gray-300" />;

export default async function InformationPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const user = await getUserByUserId(session?.user.user_id);

  if (!user) throw new Error('User not found');

  return (
    <>
      <h2 className="text-1.875">회원정보</h2>
      <div className="w-full h-0.5 bg-black" />
      <div className="flex flex-col py-6 gap-6 w-full">
        <ProfileEmail user={user} />
        <Divider />
        <ProfileNickname user={user} />
        <Divider />
        <ProfileName user={user} />
        <Divider />
      </div>
    </>
  );
}
