import { User } from 'next-auth';
import { getAddressesByUserId } from '../action';
import AddAddress from './AddAddress';
import EditAddress from './EditAddress';

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
