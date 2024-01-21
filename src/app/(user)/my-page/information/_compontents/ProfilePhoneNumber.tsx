'use client';
import { User } from '@/types/types';
import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import Spinner from '@/components/Spinner';
import { phoneRegex } from '@/lib/utils/regex';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';

const ProfilePhoneNumber = ({ user }: { user: User }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number ?? '');

  const onChangePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 13) return;
    setPhoneNumber(formatPhoneNumber(event.target.value));
  };

  const handleClickSaveButton = async () => {
    try {
      if (!phoneRegex.test(phoneNumber)) {
        alert('휴대폰 번호를 확인해주세요!');
        return;
      }

      setIsLoading(true);

      const response = await fetch('/api/user/information', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: user.user_id,
          targets: { phone_number: phoneNumber },
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
          <span>휴대폰 번호</span>
          <span className="">{user.phone_number}</span>
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
          type="text"
          placeholder="휴대폰 번호를 입력해주세요"
          value={phoneNumber}
          onChange={onChangePhoneNumber}
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

export default ProfilePhoneNumber;
