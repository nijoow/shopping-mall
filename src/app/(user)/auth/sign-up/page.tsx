'use client';
import Spinner from '@/components/Spinner';
import { cn } from '@/lib/utils/cn';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';

type SignUpInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
};

type Step = 'EMAIL' | 'PASSWORD' | 'NICKNAME';

const SignUpPage = () => {
  // hooks

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignUpInput>({ mode: 'onChange', reValidateMode: 'onChange' });

  // states
  const [step, setStep] = useState<Step>('EMAIL');
  const [loading, setLoading] = useState(false);

  // constants
  const email = watch('email');
  const password = watch('password');
  const passwordConfirm = watch('passwordConfirm');
  const nickname = watch('nickname');

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const satisfyMinLength = password && password.length >= 8;

  const isValidPassword =
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    satisfyMinLength;

  const disabledNextButton = {
    email: !(email && !errors.email && !loading),
    password: !(
      password &&
      passwordConfirm &&
      isValidPassword &&
      !errors.passwordConfirm
    ),
    nickname: !nickname && loading,
  };

  // functions
  const handleClickNextButtonEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/user/duplication/${email}`);
      if (response.ok) {
        const data = await response.json();

        if (data.isDuplicated) {
          setError('email', {
            type: 'duplicated',
            message: '이미 가입되어있는 이메일입니다!',
          });
          return;
        }
        setStep('PASSWORD');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<SignUpInput> = async submitData => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: submitData.email,
          password: submitData.password,
          nickname: submitData.nickname,
        }),
      });
      if (response.ok) {
        signIn('credentials', submitData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <span className="mx-auto font-semibold text-black text-2">
          회원가입
        </span>
        <div className="w-full h-1 bg-gray-200 ">
          <div
            className={cn('h-1 bg-black transition-all duration-300', {
              'w-1/3': step === 'EMAIL',
              'w-2/3': step === 'PASSWORD',
              'w-full': step === 'NICKNAME',
            })}
          />
        </div>
        <form
          className="flex flex-col gap-0.5 overflow-hidden"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className={cn('h-full flex w-[300%]', {
              'translate-x-0': step === 'EMAIL',
              '-translate-x-1/3': step === 'PASSWORD',
              '-translate-x-2/3': step === 'NICKNAME',
            })}
          >
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>이메일</span>
                <input
                  placeholder="이메일을 입력해주세요"
                  {...register('email', {
                    required: '이메일은 필수입니다!',
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
                disabled={disabledNextButton.email}
                onClick={handleClickNextButtonEmail}
              >
                {loading ? (
                  <Spinner fill="white" width={20} className="mx-auto" />
                ) : (
                  '다음'
                )}
              </button>
            </div>
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>비밀번호</span>
                <input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  {...register('password', {
                    required: true,
                  })}
                  style={{ imeMode: 'disabled' }}
                  className="p-3 border border-gray-300 "
                />
                <div className="flex w-full gap-3 text-0.875">
                  {[
                    { text: '대문자', validate: hasUpperCase },
                    { text: '소문자', validate: hasLowerCase },
                    { text: '숫자', validate: hasNumber },
                    { text: '특수문자', validate: hasSpecialChar },
                    { text: '8자리 이상', validate: satisfyMinLength },
                  ].map(({ text, validate }) => (
                    <div
                      key={text}
                      className={cn('flex gap-1 items-center', {
                        'text-red-400': !validate,
                        'text-green-400': validate,
                      })}
                    >
                      <IoShieldCheckmarkSharp className="text-1" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-0.5">
                <span>패스워드 확인</span>
                <input
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  {...register('passwordConfirm', {
                    required: true,
                    validate: value =>
                      value === watch('password') ||
                      '비밀번호가 일치하지 않습니다!',
                  })}
                  className="p-3 border border-gray-300"
                />
                {errors.passwordConfirm && (
                  <span className="text-0.875 text-red-400">
                    {errors.passwordConfirm.message}
                  </span>
                )}
              </label>
              <button
                type="button"
                disabled={disabledNextButton.password}
                className="p-3 text-white bg-black disabled:bg-black/40"
                onClick={() => {
                  if (!(isValidPassword || !errors.passwordConfirm)) return;
                  setStep('NICKNAME');
                }}
              >
                다음
              </button>
              <button
                type="button"
                className="p-3 text-black border border-black"
                onClick={() => {
                  setStep('EMAIL');
                }}
              >
                뒤로
              </button>
            </div>
            <div className="flex flex-col w-1/3 gap-4">
              <label className="flex flex-col gap-0.5">
                <span>닉네임</span>
                <input
                  type="text"
                  placeholder="닉네임을 입력해주세요"
                  {...register('nickname', { required: true })}
                  className="p-3 border border-gray-300"
                />
                {errors.nickname && (
                  <span className="text-0.875 text-red-400">
                    {errors.nickname.message}
                  </span>
                )}
              </label>
              <button
                type="submit"
                disabled={disabledNextButton.nickname}
                className="p-3 text-white bg-black disabled:bg-black/40"
              >
                {loading ? (
                  <Spinner fill="white" width={20} className="mx-auto" />
                ) : (
                  '다음'
                )}
              </button>
              <button
                type="button"
                className="p-3 text-black border border-black"
                onClick={() => {
                  setStep('PASSWORD');
                }}
              >
                뒤로
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
