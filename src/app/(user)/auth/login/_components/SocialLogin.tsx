'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

const SocialLogin = () => (
  <div className="flex w-auto items-center justify-between">
    <button
      type="button"
      className="relative h-12 w-12"
      onClick={() => signIn('google', { callbackUrl: `/` })}
    >
      <Image src="/images/icons/google.svg" fill alt="google" />
    </button>
  </div>
);

export default SocialLogin;
