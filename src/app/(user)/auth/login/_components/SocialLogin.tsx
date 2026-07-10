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
  <div className="flex w-full items-center justify-center gap-4">
    {socialLoginList.map(({ provider, src, alt }) => (
      <button
        key={provider}
        type="button"
        aria-label={alt}
        className="street-card street-card-hover flex h-14 w-14 items-center justify-center"
        onClick={() => signIn(provider, { callbackUrl: `/` })}
      >
        <Image src={src} width={32} height={32} alt="" />
      </button>
    ))}
  </div>
);

export default SocialLogin;
