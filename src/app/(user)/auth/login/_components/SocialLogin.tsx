'use client';
import React from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

const SocialLogin = () => {
  return (
    <div className="flex w-auto items-center justify-between">
      <button
        className="relative h-12 w-12"
        onClick={() => signIn('google', { callbackUrl: `/` })}
      >
        <Image src={'/images/icons/google.svg'} fill alt={'google'} />
      </button>
    </div>
  );
};

export default SocialLogin;
