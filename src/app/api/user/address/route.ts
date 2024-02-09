import {
  addUserAddress,
} from '@/lib/database/address';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, name, phoneNumber, postCode, address, detailAddress } = body;

  try {
    await addUserAddress({
      userId,
      name,
      phoneNumber,
      postCode,
      address,
      detailAddress,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  } finally {
    revalidatePath('/my-page/address');
  }

  return NextResponse.json('SUCCESS');
}
