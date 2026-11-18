'use server';

import { addressFormSchema } from '@/types/schema';
import { Address, AddressFormInput } from '@/types/types';
import { sql } from '@vercel/postgres';
import { auth } from 'auth';
import { revalidatePath } from 'next/cache';

/** 세션의 user_id를 반환한다. 미로그인 호출은 즉시 실패한다. */
const getSessionUserId = async () => {
  const session = await auth();
  const userId = session?.user.user_id;

  if (!userId) throw new Error('Unauthorized');

  return userId;
};

export const getMyAddresses = async (): Promise<Address[]> => {
  const userId = await getSessionUserId();

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
    throw new Error('Failed to fetch addresses.');
  }
};

export const addUserAddress = async (input: AddressFormInput) => {
  const userId = await getSessionUserId();
  const { name, phoneNumber, postCode, address, detailAddress } =
    addressFormSchema.parse(input);

  try {
    await sql`
        INSERT INTO
            address (user_id, name, phone_number, post_code, address, detail_address)
        VALUES
            (${userId}, ${name}, ${phoneNumber}, ${postCode}, ${address}, ${detailAddress})
    `;
  } catch (error) {
    throw new Error('Failed to add address.');
  }

  revalidatePath('/my-page/addresses');
};

export const editUserAddress = async (
  input: AddressFormInput & { addressId: number },
) => {
  const userId = await getSessionUserId();
  const { name, phoneNumber, postCode, address, detailAddress } =
    addressFormSchema.parse(input);

  try {
    await sql`
        UPDATE
            address
        SET
            name = ${name},
            phone_number = ${phoneNumber},
            post_code = ${postCode},
            address = ${address},
            detail_address = ${detailAddress}
        WHERE
            address_id = ${input.addressId} AND user_id = ${userId}
    `;
  } catch (error) {
    throw new Error('Failed to edit address.');
  }

  revalidatePath('/my-page/addresses');
};

export const deleteUserAddress = async ({
  addressId,
}: {
  addressId: number;
}) => {
  const userId = await getSessionUserId();

  try {
    await sql`
        DELETE FROM
            address
        WHERE
            address_id = ${addressId} AND user_id = ${userId}
    `;
  } catch (error) {
    throw new Error('Failed to delete address.');
  }

  revalidatePath('/my-page/addresses');
};
