'use client';
import { User } from '@/types/types';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import Spinner from '@/components/Spinner';

const ProfileName = ({ user }: { user: User }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleClickSaveButton = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/user/information', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: user.user_id,
          targets: { name: nameRef.current?.value },
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
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col py-2">
          <span>이름</span>
          <span className="">{user.name}</span>
        </div>
        <button
          className="rounded-md px-8 py-1 border-2 font-medium border-gray-200 drop-shadow-sm text-gray-500"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '취소' : '수정'}
        </button>
      </div>
      <form
        className={cn(
          'w-full gap-2 overflow-hidden transition-all flex flex-col',
          {
            'h-0 opacity-0': !isEditing,
            'h-[86px] opacity-100': isEditing,
          },
        )}
      >
        <input
          ref={nameRef}
          type="text"
          placeholder="이름을 입력해주세요"
          defaultValue={user.name ?? ''}
          className="px-3 py-2.5 rounded-md text-1 border border-gray-300 w-full"
        />
        <button
          type="button"
          onClick={handleClickSaveButton}
          disabled={isLoading}
          className="rounded-md px-8 py-1 bg-black text-white self-end"
        >
          {isLoading ? <Spinner fill="white" width={20} /> : '저장'}
        </button>
      </form>
    </div>
  );
};

export default ProfileName;
