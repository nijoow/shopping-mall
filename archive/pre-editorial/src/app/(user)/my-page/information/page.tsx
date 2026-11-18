import { getUserByUserId } from '@/lib/database/user';
import { auth } from 'auth';
import { redirect } from 'next/navigation';
import ProfileField from './_components/ProfileField';

export default async function InformationPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const user = await getUserByUserId(session.user.user_id);

  if (!user) throw new Error('User not found');

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-border pb-5">
        <h2 className="display text-1.5 leading-tight">
          PROFILE<span className="text-volt">.</span>
        </h2>
        <p className="text-0.875 text-muted-foreground">
          회원정보를 확인하고 수정할 수 있어요.
        </p>
      </header>

      <div className="street-card flex w-full flex-col divide-y divide-border px-5">
        {/* 이메일은 로그인 식별자이므로 수정할 수 없다 */}
        <div className="flex flex-col gap-0.5 py-4">
          <span className="display text-0.75 tracking-widest text-muted-foreground">
            EMAIL
          </span>
          <span>{user.email}</span>
        </div>
        <ProfileField
          label="NAME"
          field="name"
          defaultValue={user.name}
          placeholder="이름을 입력해주세요"
        />
        <ProfileField
          label="NICKNAME"
          field="nickname"
          defaultValue={user.nickname}
          placeholder="닉네임을 입력해주세요"
        />
        <ProfileField
          label="PHONE"
          field="phone_number"
          defaultValue={user.phone_number}
          placeholder="휴대폰 번호를 입력해주세요"
        />
      </div>
    </div>
  );
}
