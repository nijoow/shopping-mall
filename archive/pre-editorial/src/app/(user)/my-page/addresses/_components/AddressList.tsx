import { getMyAddresses } from '../action';
import AddAddress from './AddAddress';
import EditAddress from './EditAddress';

const AddressList = async () => {
  const addresses = await getMyAddresses();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AddAddress />
      {addresses.map(address => (
        <EditAddress key={address.address_id} address={address} />
      ))}
    </div>
  );
};

export default AddressList;
