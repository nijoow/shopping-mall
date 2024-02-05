import React from 'react';
import AddAddress from './AddAddress';
import { User } from 'next-auth';

const AddressList = ({ user }: { user: User }) => {
  return (
    <div>
      <AddAddress user={user} />
    </div>
  );
};

export default AddressList;
