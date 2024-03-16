import React from 'react';
import AddAddress from './AddAddress';
import { User } from 'next-auth';
import EditAddress from './EditAddress';
import { getAddressesByUserId } from '../action';

const AddressList = async ({ user }: { user: User }) => {
  const addresses = await getAddressesByUserId(user.user_id);

  return (
    <div className="grid grid-cols-2 gap-4">
      <AddAddress user={user} />
      {addresses?.map(address => (
        <EditAddress key={address.address_id} address={address} />
      ))}
    </div>
  );
};

export default AddressList;
