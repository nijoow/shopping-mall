'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

const socialLoginList = [
  {
    provider: 'kakao',
    src: '/images/icons/kakao.svg',
    alt: '카카오 로그인',
  },
  {
    provider: 'naver',
    src: '/images/icons/naver.svg',
    alt: '네이버 로그인',
  },
  {
    provider: 'google',
    src: '/images/icons/google.svg',
    alt: '구글 로그인',
  },
];
const SocialLogin = () => (
  <div className="flex w-auto items-center justify-between gap-8">
    {socialLoginList.map(({ provider, src, alt }) => (
      <button
        key={provider}
        type="button"
        className="relative h-12 w-12"
        onClick={() => signIn(provider, { callbackUrl: `/` })}
      >
        <Image src={src} fill alt={alt} />
      </button>
    ))}
  </div>
);

export default SocialLogin;
