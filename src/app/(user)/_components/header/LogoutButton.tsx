import { signOut } from 'auth';
import React from 'react';

const LogoutButton = () => {
  const logOut = async () => {
    'use server';
    await signOut();
  };

  return (
    <form action={logOut}>
      <button>LOGOUT</button>
    </form>
  );
};

export default LogoutButton;
