'use client';
import React from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

const SocialLogin = () => {
  return (
    <div className="flex items-center justify-between w-auto">
      <button
        className="relative w-12 h-12"
        onClick={() => signIn('google', { callbackUrl: `/` })}
      >
        <Image src={'/images/icons/google.svg'} fill alt={'google'} />
      </button>
    </div>
  );
};

export default SocialLogin;
