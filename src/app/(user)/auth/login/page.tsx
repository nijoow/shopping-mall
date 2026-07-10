'use client';

import FullpageSpinner from '@/components/FullpageSpinner';
import { Button } from '@/components/ui/button';
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

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  UserNotFoundError: '존재하지 않는 이메일입니다.',
  PasswordNotMatchedError: '비밀번호가 일치하지 않습니다.',
  CredentialsValidationError: '입력 형식이 올바르지 않습니다.',
  NotCredentialsUserError: '해당 계정은 소셜로그인으로 로그인 할 수 있습니다.',
  RateLimitedError: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
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
        setError('root', {
          message:
            LOGIN_ERROR_MESSAGES[response.code ?? ''] ??
            '로그인을 실패하였습니다.',
        });
        return;
      }

      if (response?.url) {
        router.push(response.url);
        router.refresh();
      }
    } catch (error) {
      setError('root', { message: '로그인을 실패하였습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[70dvh] w-full items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-sm animate-fade-up flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="display text-2 leading-none">
              SIGN <span className="text-outline">IN</span>
              <span className="text-volt">.</span>
            </h1>
            <p className="text-0.875 text-muted-foreground">
              NIJOOW 계정으로 로그인하고 나만의 스트릿을 완성하세요.
            </p>
          </div>

          <form
            className="street-card flex flex-col gap-4 p-6 shadow-street sm:p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="flex flex-col gap-1.5">
              <span className="display text-0.75 tracking-widest text-muted-foreground">
                EMAIL
              </span>
              <input
                type="email"
                placeholder="이메일"
                autoComplete="email"
                {...register('email', { required: true })}
                className="input-field"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="display text-0.75 tracking-widest text-muted-foreground">
                PASSWORD
              </span>
              <input
                type="password"
                placeholder="비밀번호"
                autoComplete="current-password"
                {...register('password', { required: true })}
                className="input-field"
              />
            </label>

            <span role="alert" className="h-4 text-0.875 text-destructive">
              {errors.root?.message}
            </span>

            <Button type="submit" variant="volt" size="lg" disabled={loading}>
              SIGN IN
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-0.5 flex-auto bg-border" />
            <span className="display text-0.625 tracking-widest text-muted-foreground">
              OR CONTINUE WITH
            </span>
            <span className="h-0.5 flex-auto bg-border" />
          </div>

          <SocialLogin />

          <p className="text-center text-0.875 text-muted-foreground">
            아직 계정이 없나요?{' '}
            <Link
              href="/auth/sign-up"
              className="display text-0.875 tracking-widest text-foreground underline decoration-volt decoration-2 underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
      {loading && <FullpageSpinner />}
    </>
  );
}
