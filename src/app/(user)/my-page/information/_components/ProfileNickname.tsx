'use client';
import { User } from '@/types/types';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import Spinner from '@/components/Spinner';

const ProfileNickname = ({ user }: { user: User }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);

  const handleClickSaveButton = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/user/information', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: user.user_id,
          targets: { nickname: nicknameRef.current?.value },
        }),
      });
      if (response.ok) {
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col py-2">
          <span>닉네임</span>
          <span className="">{user.nickname}</span>
        </div>
        <button
          className="rounded-md border-2 border-gray-200 px-8 py-1 font-medium text-gray-500 drop-shadow-sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '취소' : '수정'}
        </button>
      </div>
      <form
        className={cn(
          'flex w-full flex-col gap-2 overflow-hidden transition-all',
          {
            'h-0 opacity-0': !isEditing,
            'h-[86px] opacity-100': isEditing,
          },
        )}
      >
        <input
          ref={nicknameRef}
          type="text"
          placeholder="닉네임을 입력해주세요"
          defaultValue={user.nickname ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-1"
        />
        <button
          type="button"
          onClick={handleClickSaveButton}
          disabled={isLoading}
          className="self-end rounded-md bg-black px-8 py-1 text-white"
        >
          {isLoading ? <Spinner fill="white" width={20} /> : '저장'}
        </button>
      </form>
    </div>
  );
};

export default ProfileNickname;
