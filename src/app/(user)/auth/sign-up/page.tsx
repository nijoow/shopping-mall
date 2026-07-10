'use client';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';

type SignUpInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
};

type Step = 'EMAIL' | 'PASSWORD' | 'NICKNAME';

const STEPS: { id: Step; label: string }[] = [
  { id: 'EMAIL', label: '01 EMAIL' },
  { id: 'PASSWORD', label: '02 PASSWORD' },
  { id: 'NICKNAME', label: '03 PROFILE' },
];

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignUpInput>({ mode: 'onChange', reValidateMode: 'onChange' });

  const [step, setStep] = useState<Step>('EMAIL');
  const [loading, setLoading] = useState(false);

  const slideViewportRef = useRef<HTMLDivElement>(null);

  /* 포커스된 입력을 따라 클리핑 컨테이너가 스크롤되면 패널이 어긋나므로 리셋 */
  const resetSlideScroll = () => slideViewportRef.current?.scrollTo({ left: 0 });

  useEffect(resetSlideScroll, [step]);

  const stepIndex = STEPS.findIndex(({ id }) => id === step);

  const email = watch('email');
  const password = watch('password');
  const passwordConfirm = watch('passwordConfirm');
  const nickname = watch('nickname');

  const passwordRules = [
    { text: '대문자', satisfied: /[A-Z]/.test(password) },
    { text: '소문자', satisfied: /[a-z]/.test(password) },
    { text: '숫자', satisfied: /\d/.test(password) },
    { text: '특수문자', satisfied: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    {
      text: '8자리 이상',
      satisfied: Boolean(password && password.length >= 8),
    },
  ];

  const isValidPassword = passwordRules.every(({ satisfied }) => satisfied);

  const disabledNextButton = {
    email: !email || Boolean(errors.email) || loading,
    password: !(
      password &&
      passwordConfirm &&
      isValidPassword &&
      !errors.passwordConfirm
    ),
    nickname: !nickname || loading,
  };

  const handleClickNextButtonEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/user/duplication/${email}`);

      if (!response.ok) {
        setError('root', { message: '잠시 후 다시 시도해주세요.' });
        return;
      }

      const data = await response.json();

      if (data.isDuplicated) {
        setError('email', {
          type: 'duplicated',
          message: '이미 가입되어있는 이메일입니다!',
        });
        return;
      }

      setStep('PASSWORD');
    } catch (error) {
      setError('root', { message: '잠시 후 다시 시도해주세요.' });
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

      if (!response.ok) {
        setError('root', {
          message: '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      await signIn('credentials', {
        email: submitData.email,
        password: submitData.password,
        callbackUrl: '/',
      });
    } catch (error) {
      setError('root', {
        message: '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70dvh] w-full items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm animate-fade-up flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="display text-2 leading-none">
            SIGN <span className="text-outline">UP</span>
            <span className="text-volt">.</span>
          </h1>
          <p className="text-0.875 text-muted-foreground">
            NIJOOW 크루에 합류하고 신상 드롭 소식을 가장 먼저 받아보세요.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            {STEPS.map(({ id, label }, index) => (
              <span
                key={id}
                className={cn(
                  'display text-0.625 tracking-widest transition-colors',
                  index <= stepIndex
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1 w-full bg-secondary">
            <div
              className="h-1 bg-volt transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <form
          className="street-card flex flex-col gap-0.5 p-6 shadow-street sm:p-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* 슬라이드 패널이 카드 패딩 영역으로 비치지 않도록 콘텐츠 박스에서 클리핑 */}
          <div ref={slideViewportRef} className="overflow-hidden">
            <div
              onTransitionEnd={resetSlideScroll}
              className={cn(
                'flex h-full w-[300%] transition-transform duration-300',
                {
                  'translate-x-0': step === 'EMAIL',
                  '-translate-x-1/3': step === 'PASSWORD',
                  '-translate-x-2/3': step === 'NICKNAME',
                },
              )}
            >
              {/* STEP 01 — 이메일 */}
              <div className="flex w-1/3 flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="display text-0.75 tracking-widest text-muted-foreground">
                    EMAIL
                  </span>
                  <input
                    placeholder="이메일을 입력해주세요"
                    autoComplete="email"
                    {...register('email', {
                      required: '이메일은 필수입니다!',
                      pattern: {
                        value:
                          /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
                        message: '올바른 이메일 형식이 아닙니다!',
                      },
                    })}
                    className="input-field"
                  />
                  {errors.email && (
                    <span className="text-0.875 text-destructive">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <Button
                  type="button"
                  variant="volt"
                  size="lg"
                  disabled={disabledNextButton.email}
                  onClick={handleClickNextButtonEmail}
                >
                  {loading ? (
                    <Spinner
                      fill="currentColor"
                      width={20}
                      className="mx-auto"
                    />
                  ) : (
                    'NEXT'
                  )}
                </Button>
              </div>

              {/* STEP 02 — 비밀번호 */}
              <div className="flex w-1/3 flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="display text-0.75 tracking-widest text-muted-foreground">
                    PASSWORD
                  </span>
                  <input
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    autoComplete="new-password"
                    {...register('password', {
                      required: true,
                    })}
                    className="input-field"
                  />
                  <div className="flex w-full flex-wrap gap-x-3 gap-y-1 text-0.75">
                    {passwordRules.map(({ text, satisfied }) => (
                      <div
                        key={text}
                        className={cn(
                          'flex items-center gap-1 transition-colors',
                          satisfied
                            ? 'text-foreground'
                            : 'text-muted-foreground/70',
                        )}
                      >
                        <IoShieldCheckmarkSharp
                          className={cn('text-0.875', satisfied && 'text-ring')}
                        />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="display text-0.75 tracking-widest text-muted-foreground">
                    CONFIRM PASSWORD
                  </span>
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요"
                    autoComplete="new-password"
                    {...register('passwordConfirm', {
                      required: true,
                      validate: value =>
                        value === watch('password') ||
                        '비밀번호가 일치하지 않습니다!',
                    })}
                    className="input-field"
                  />
                  {errors.passwordConfirm && (
                    <span className="text-0.875 text-destructive">
                      {errors.passwordConfirm.message}
                    </span>
                  )}
                </label>
                <Button
                  type="button"
                  variant="volt"
                  size="lg"
                  disabled={disabledNextButton.password}
                  onClick={() => setStep('NICKNAME')}
                >
                  NEXT
                </Button>
                <Button
                  type="button"
                  variant="street-outline"
                  size="lg"
                  onClick={() => setStep('EMAIL')}
                >
                  BACK
                </Button>
              </div>

              {/* STEP 03 — 프로필 */}
              <div className="flex w-1/3 flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="display text-0.75 tracking-widest text-muted-foreground">
                    NICKNAME
                  </span>
                  <input
                    type="text"
                    placeholder="닉네임을 입력해주세요"
                    {...register('nickname', { required: true })}
                    className="input-field"
                  />
                  {errors.nickname && (
                    <span className="text-0.875 text-destructive">
                      {errors.nickname.message}
                    </span>
                  )}
                </label>
                <Button
                  type="submit"
                  variant="volt"
                  size="lg"
                  disabled={disabledNextButton.nickname}
                >
                  {loading ? (
                    <Spinner
                      fill="currentColor"
                      width={20}
                      className="mx-auto"
                    />
                  ) : (
                    'JOIN THE CREW'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="street-outline"
                  size="lg"
                  onClick={() => setStep('PASSWORD')}
                >
                  BACK
                </Button>
              </div>
            </div>
          </div>
          {errors.root && (
            <span role="alert" className="pt-2 text-0.875 text-destructive">
              {errors.root.message}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
