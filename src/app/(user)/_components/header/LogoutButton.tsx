'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { logout } from '../../_lib/actions';

const LogoutButton = () => {
  const router = useRouter();
  const handleClickLogoutButton = async () => {
    logout();
    router.refresh();
  };

  return (
    <button type="button" onClick={handleClickLogoutButton}>
      LOGOUT
    </button>
  );
};

export default LogoutButton;
