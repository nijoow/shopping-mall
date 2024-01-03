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
      className="gap-1 flex items-center"
      onClick={handleClickLogoutButton}
    >
      <IoLogOut size={20} />
      <span className="text-0.75">LOGOUT</span>
    </button>
  );
};

export default LogoutButton;
