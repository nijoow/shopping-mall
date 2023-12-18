'use client';

import Link from 'next/link';
import SocialLogin from './_compontents/SocialLogin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';

type LoginInput = {
  userId: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit: SubmitHandler<LoginInput> = submitData => {
    signIn('credentials', submitData);
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <span className="mx-auto font-semibold text-2 text-rose-400">
          로그인
        </span>
        <div className="w-full h-1 bg-rose-400" />
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <label>아이디</label>
          <input
            {...register('userId', { required: true })}
            className="p-3 border border-gray-300"
          />
          <label>패스워드</label>
          <input
            {...register('password', { required: true })}
            className="p-3 border border-gray-300"
          />
          <button type="submit" className="p-3 text-white bg-rose-400">
            로그인
          </button>
        </form>
        <div className="flex items-center justify-center w-full gap-4 text-gray-400">
          <Link href={'/auth/login/find/id'}>아이디 찾기</Link>
          <div className="w-0.5 h-3.5 bg-gray-300" />
          <Link href={'/auth/login/find/password'}>비밀번호 찾기</Link>
        </div>
        <SocialLogin />
        <Link
          href={'/auth/sign-up'}
          className="p-3 text-center text-black border border-black"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
