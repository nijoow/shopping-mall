'use client';

import FullpageSpinner from '@/components/FullpageSpinner';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import SocialLogin from './_components/SocialLogin';

type LoginInput = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>();

  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginInput> = async submitData => {
    try {
      setLoading(true);

      const response = await signIn('credentials', {
        ...submitData,
        redirect: false,
        callbackUrl: '/',
      });

      if (response?.error) {
        switch (response.code) {
          case 'UserNotFoundError':
            setError('root', { message: '존재하지 않는 이메일입니다.' });
            break;
          case 'PasswordNotMatchedError':
            setError('root', { message: '비밀번호가 일치하지 않습니다.' });
            break;
          case 'CredentialsValidationError':
            setError('root', { message: '입력 형식이 올바르지 않습니다.' });
            break;
          case 'NotCredentialsUserError':
            setError('root', {
              message: '해당 계정은 소셜로그인으로 로그인 할 수 있습니다.',
            });
            break;
          default:
            setError('root', {
              message: '로그인을 실패하였습니다.',
            });
        }
      }
      if (response?.url) {
        router.push(response.url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <span className="mx-auto text-2 font-semibold text-black">
            로그인
          </span>
          <div className="h-1 w-full bg-black" />
          <form className="flex flex-col " onSubmit={handleSubmit(onSubmit)}>
            <label className="flex flex-col gap-0.5">
              <span>이메일</span>
              <input
                type="email"
                placeholder="이메일을 입력해주세요"
                {...register('email', { required: true })}
                className="border border-gray-300 p-3"
              />
            </label>

            <label className="mt-2 flex flex-col gap-0.5">
              <span>비밀번호</span>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                {...register('password', { required: true })}
                className="border border-gray-300 p-3"
              />
            </label>

            <span className="mt-1 h-3 text-sm text-red-500">
              {errors.root?.message}
            </span>

            <button type="submit" className="mt-4 bg-black p-3 text-white">
              로그인
            </button>
          </form>
          {/* <div className="flex items-center justify-center w-full gap-4 text-gray-400">
          <Link href={'/auth/login/find/id'}>아이디 찾기</Link>
          <div className="w-0.5 h-3.5 bg-gray-300" />
          <Link href={'/auth/login/find/password'}>비밀번호 찾기</Link>
        </div> */}
          <div className="flex w-full justify-center">
            <SocialLogin />
          </div>
          <Link
            href="/auth/sign-up"
            className="border border-black p-3 text-center text-black"
          >
            회원가입
          </Link>
        </div>
      </div>
      {loading && <FullpageSpinner />}
    </>
  );
}
