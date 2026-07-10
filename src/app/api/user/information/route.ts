import { updateUserInformation } from '@/lib/database/user';
import { phoneRegex } from '@/utils/regex';
import { auth } from 'auth';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateInformationSchema = z.object({
  targets: z
    .object({
      name: z.string().trim().min(1).max(50),
      nickname: z.string().trim().min(1).max(50),
      phone_number: z.string().regex(phoneRegex),
    })
    .partial()
    .refine(targets => Object.keys(targets).length > 0, {
      message: 'No targets to update',
    }),
});

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user.user_id;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = updateInformationSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 },
    );
  }

  try {
    await updateUserInformation(userId, parsed.data.targets);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update user information' },
      { status: 500 },
    );
  }

  revalidatePath('/my-page');
  revalidatePath('/my-page/information');

  return NextResponse.json({ message: 'SUCCESS' });
}
