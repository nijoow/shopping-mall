'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type Step = 'ID' | 'PASSWORD' | 'NAME' | 'SUBMIT';

const nextStep = {
  ID: 'PASSWORD' as Step,
  PASSWORD: 'NAME' as Step,
  NAME: 'SUBMIT' as Step,
};

const SignupPage = () => {
  const [step, setStep] = useState<Step>('ID');
  const router = useRouter();

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <span className="mx-auto font-semibold text-2 text-rose-400">
          회원가입
        </span>
        <div className="w-full h-1 bg-gray-200 ">
          <div className="w-1/2 h-1 bg-rose-400" />
        </div>
        <div className="flex flex-col gap-2">
          {
            {
              ID: (
                <>
                  <span>로그인에 사용할 아이디를 입력해주세요</span>
                  <input
                    type="text"
                    placeholder="아이디"
                    className="p-3 border border-gray-300"
                  />
                </>
              ),
              PASSWORD: (
                <>
                  <span>로그인에 사용할 비밀번호를 입력해주세요</span>
                  <input
                    type="text"
                    placeholder="비밀번호"
                    className="p-3 border border-gray-300"
                  />

                  <input
                    type="text"
                    placeholder="비밀번호 확인"
                    className="p-3 border border-gray-300"
                  />
                </>
              ),
              NAME: (
                <>
                  <span>이름을 입력해주세요</span>
                  <input
                    type="text"
                    placeholder="이름"
                    className="p-3 border border-gray-300"
                  />
                </>
              ),
              SUBMIT: 'SUBMIT',
            }[step]
          }
        </div>
        <button
          className="p-3 text-white bg-rose-400"
          onClick={async () => {
            if (step === 'SUBMIT') {
              const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: 'test',
                  password: 'test',
                  name: 'test',
                }),
              });
              const data = await res.json();

              return;
              //   router.push('/auth/login');
            }
            setStep(nextStep[step]);
          }}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
