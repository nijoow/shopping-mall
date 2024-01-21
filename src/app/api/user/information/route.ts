import { updateUserInformation } from '@/lib/database/user';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const body = await request.json();
  const { user_id, targets } = body;

  try {
    const query = Object.entries(targets)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');

    await updateUserInformation(user_id, query);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  } finally {
    revalidatePath('/my-page/information');
  }

  return NextResponse.json('SUCCESS');
}
