'use client';
import { cn } from '@/lib/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type SignUpInput = {
  email: string;
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
  } = useForm<SignUpInput>({ mode: 'onChange' });

  const onSubmit: SubmitHandler<SignUpInput> = async submitData => {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: submitData.email,
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
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>이메일</span>
                <input
                  placeholder="이메일을 입력해주세요"
                  {...register('email', {
                    required: true,
                    pattern: {
                      value:
                        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
                      message: '올바른 이메일 형식이 아닙니다!',
                    },
                  })}
                  className="p-3 border border-gray-300"
                />
                {errors.email && (
                  <span className="text-0.875 text-red-400">
                    {errors.email.message}
                  </span>
                )}
              </label>
              <button
                className="p-3 text-white bg-black disabled:bg-black/40"
                type="button"
                disabled={!!errors.email}
                onClick={() => {
                  setStep('PASSWORD');
                }}
              >
                다음
              </button>
            </div>
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>패스워드</span>
                <input
                  {...register('password', {
                    required: true,
                    minLength: {
                      value: 8,
                      message: 'Password must have at least 8 characters',
                    },
                  })}
                  className="p-3 border border-gray-300"
                />
                {errors.password && <span>This field is required</span>}
              </label>
              <label className="flex flex-col gap-0.5">
                <span>패스워드 확인</span>
                <input
                  {...register('passwordConfirm', { required: true })}
                  className="p-3 border border-gray-300"
                />
                {errors.passwordConfirm && <span>This field is required</span>}
              </label>
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
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>이름</span>
                <input
                  {...register('name', { required: true })}
                  className="p-3 border border-gray-300"
                />
                {errors.name && <span>This field is required</span>}
              </label>
              <button type="submit" className="p-3 text-white bg-black">
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
