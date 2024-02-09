import {
  addUserAddress,
  deleteUserAddress,
  editUserAddress,
} from '@/lib/database/address';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

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
    if (path) revalidatePath(path);
  }

  return NextResponse.json('SUCCESS');
}

export async function PUT(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  const body = await request.json();
  const { addressId, name, phoneNumber, postCode, address, detailAddress } =
    body;

  try {
    await editUserAddress({
      addressId,
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
    if (path) revalidatePath(path);
  }

  return NextResponse.json('SUCCESS');
}

export async function DELETE(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  const body = await request.json();
  const { addressId } = body;

  try {
    await deleteUserAddress({
      addressId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  } finally {
    if (path) revalidatePath(path);
  }

  return NextResponse.json('SUCCESS');
}
