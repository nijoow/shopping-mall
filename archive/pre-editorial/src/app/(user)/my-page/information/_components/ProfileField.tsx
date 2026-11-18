'use client';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import type { UpdatableUserColumn } from '@/lib/database/user';
import { formatPhoneNumber } from '@/utils';
import { phoneRegex } from '@/utils/regex';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ProfileField = ({
  label,
  field,
  defaultValue,
  placeholder,
}: {
  label: string;
  field: UpdatableUserColumn;
  defaultValue: string | null;
  placeholder: string;
}) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(defaultValue ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPhone = field === 'phone_number';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPhone) {
      if (event.target.value.length > 13) return;
      setValue(formatPhoneNumber(event.target.value));
      return;
    }
    setValue(event.target.value);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setErrorMessage(null);
    setValue(defaultValue ?? '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setErrorMessage('값을 입력해주세요.');
      return;
    }
    if (isPhone && !phoneRegex.test(trimmedValue)) {
      setErrorMessage('휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/user/information', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: { [field]: trimmedValue } }),
      });

      if (!response.ok) throw new Error('Failed to update user information');

      setIsEditing(false);
      setErrorMessage(null);
      router.refresh();
    } catch (error) {
      setErrorMessage('저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col py-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="display text-0.75 tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="truncate">
            {defaultValue || <span className="text-muted-foreground">미입력</span>}
          </span>
        </div>
        <Button
          type="button"
          variant="street-outline"
          size="sm"
          onClick={() => (isEditing ? closeEditor() : setIsEditing(true))}
        >
          {isEditing ? '취소' : '수정'}
        </Button>
      </div>
      {isEditing && (
        <form className="flex flex-col gap-2 pt-3" onSubmit={handleSubmit}>
          <input
            type={isPhone ? 'tel' : 'text'}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="input-field"
          />
          {errorMessage && (
            <span role="alert" className="text-0.875 text-destructive">
              {errorMessage}
            </span>
          )}
          <Button
            type="submit"
            variant="volt"
            size="sm"
            className="self-end px-6"
            disabled={isLoading}
          >
            {isLoading ? <Spinner fill="currentColor" width={18} /> : '저장'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ProfileField;
