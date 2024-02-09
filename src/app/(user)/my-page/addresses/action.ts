'use server';

import { Address, AddressFormInput } from '@/types/types';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export const getAddressesByUserId = async (
  userId: number,
): Promise<Address[] | undefined> => {
  try {
    const addresses = await sql<Address>`
        SELECT * FROM 
            address 
        WHERE 
            user_id = ${userId}
        ORDER BY address_id DESC
    `;
    return addresses.rows;
  } catch (error) {
    console.error('Failed to fetch address:', error);
    throw new Error('Failed to fetch address.');
  }
};

export const addUserAddress = async ({
  userId,
  name,
  phoneNumber,
  postCode,
  address,
  detailAddress,
}: AddressFormInput & { userId: number }) => {
  try {
    await sql.query(`
        INSERT INTO 
            address (user_id, name, phone_number, post_code, address, detail_address) 
        VALUES 
            ('${userId}', '${name}', '${phoneNumber}', '${postCode}', '${address}', '${detailAddress}')
        `);
  } catch (error) {
    console.error('Failed to Add Address:', error);
    throw new Error('Failed to Add Address.');
  } finally {
    revalidatePath('/my-page/addresses');
  }
};

export const editUserAddress = async ({
  addressId,
  name,
  phoneNumber,
  postCode,
  address,
  detailAddress,
}: AddressFormInput & { addressId: number }) => {
  try {
    await sql.query(`
        UPDATE
            address
        SET 
            name = '${name}', 
            phone_number = '${phoneNumber}',
            post_code = '${postCode}',
            address = '${address}',
            detail_address = '${detailAddress}'
        WHERE
            address_id = '${addressId}'
    `);
  } catch (error) {
    console.error('Failed to Add Address:', error);
    throw new Error('Failed to Add Address.');
  } finally {
    revalidatePath('/my-page/addresses');
  }
};

export const deleteUserAddress = async ({
  addressId,
}: {
  addressId: number;
}) => {
  try {
    await sql.query(`
        DELETE FROM 
            address 
        WHERE
            address_id = '${addressId}'
    `);
  } catch (error) {
    console.error('Failed to Add Address:', error);
    throw new Error('Failed to Add Address.');
  } finally {
    revalidatePath('/my-page/addresses');
  }
};
