'use client';
import { cn } from '@/lib/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type SignUpInput = {
  userId: string;
  password: string;
  passwordConfirm: string;
  name: string;
};

type Step = 'USER_ID' | 'PASSWORD' | 'NAME';

const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>();

  const onSubmit: SubmitHandler<SignUpInput> = async submitData => {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: submitData.userId,
        password: submitData.password,
        name: submitData.name,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      router.push('/auth/login');
    }
  };
  const router = useRouter();
  const [step, setStep] = useState<Step>('USER_ID');

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <span className="mx-auto font-semibold text-black text-2">
          회원가입
        </span>
        <div className="w-full h-1 bg-gray-200 ">
          <div className="w-1/2 h-1 bg-black" />
        </div>
        <form
          className="flex flex-col gap-0.5 overflow-hidden"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className={cn('h-full flex w-[300%]', {
              'translate-x-0': step === 'USER_ID',
              '-translate-x-1/3': step === 'PASSWORD',
              '-translate-x-2/3': step === 'NAME',
            })}
          >
            <div className="w-1/3 flex flex-col gap-0.5">
              <label>아이디</label>
              <input
                {...register('userId', { required: true })}
                className="p-3 border border-gray-300"
              />
              {errors.userId ? (
                <span className="text-0.875 text-red-400">
                  This field is required
                </span>
              ) : (
                <span className="text-0.875">This field is required</span>
              )}
              <button
                className="p-3 text-white bg-black disabled:opacity-50"
                type="button"
                disabled={!!errors.userId}
                onClick={() => {
                  setStep('PASSWORD');
                }}
              >
                다음
              </button>
            </div>
            <div className="w-1/3 bg-red-200 flex flex-col gap-0.5">
              <label>패스워드</label>
              <input
                {...register('password', { required: true })}
                className="p-3 border border-gray-300"
              />
              {errors.password && <span>This field is required</span>}

              <label>패스워드 확인</label>
              <input
                {...register('passwordConfirm', { required: true })}
                className="p-3 border border-gray-300"
              />
              {errors.passwordConfirm && <span>This field is required</span>}
              <button
                type="button"
                className="p-3 text-white bg-black"
                onClick={() => {
                  setStep('NAME');
                }}
              >
                다음
              </button>
            </div>

            <div className="w-1/3 bg-red-200 flex flex-col gap-0.5">
              <label>이름</label>
              <input
                {...register('name', { required: true })}
                className="p-3 border border-gray-300"
              />
              {errors.name && <span>This field is required</span>}{' '}
              <button type="submit" className="p-3 text-white bg-rose-400">
                다음
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
