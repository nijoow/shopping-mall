'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { logout } from '../../_lib/actions';
import { IoLogOut } from 'react-icons/io5';

const LogoutButton = () => {
  const router = useRouter();
  const handleClickLogoutButton = async () => {
    logout();
    router.refresh();
  };

  return (
    <button
      type="button"
      className="group hidden items-center gap-1 px-2 sm:flex"
      onClick={handleClickLogoutButton}
    >
      <IoLogOut size={20} />
      <span className="hidden text-0.75 md:block">LOGOUT</span>
    </button>
  );
};

export default LogoutButton;
