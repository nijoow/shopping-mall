'use client';

import { useRouter } from 'next/navigation';
import { IoLogOutOutline } from 'react-icons/io5';
import { logout } from '../../_lib/actions';

const LogoutButton = () => {
  const router = useRouter();

  const handleClickLogoutButton = async () => {
    await logout();
    router.refresh();
  };

  return (
    <button
      type="button"
      aria-label="로그아웃"
      className="flex h-10 w-10 items-center justify-center transition-colors hover:text-volt"
      onClick={handleClickLogoutButton}
    >
      <IoLogOutOutline size={20} />
    </button>
  );
};

export default LogoutButton;
