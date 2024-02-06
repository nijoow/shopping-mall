import React from 'react';
import AddAddress from './AddAddress';
import { User } from 'next-auth';
import { getAddressesByUserId } from '@/lib/database/user';
import EditAddress from './EditAddress';

const AddressList = async ({ user }: { user: User }) => {
  const addresses = await getAddressesByUserId(user.user_id);

  return (
    <div className="grid gap-4 grid-cols-2">
      <AddAddress user={user} />
      {addresses?.map(address => (
        <EditAddress key={address.address_id} user={user} address={address} />
      ))}
    </div>
  );
};

export default AddressList;
