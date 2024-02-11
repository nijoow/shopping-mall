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
      className="gap-1 flex items-center group px-2"
      onClick={handleClickLogoutButton}
    >
      <IoLogOut size={20} />
      <span className="text-0.75 group-hover:w-[50px] overflow-hidden w-0 transition-all">
        LOGOUT
      </span>
    </button>
  );
};

export default LogoutButton;
