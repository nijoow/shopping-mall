import Link from 'next/link';
import SocialLogin from './_compontents/SocialLogin';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <span className="mx-auto font-semibold text-2 text-rose-400">
          로그인
        </span>
        <div className="w-full h-1 bg-rose-400" />
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="아이디"
            className="p-3 border border-gray-300"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="p-3 border border-gray-300"
          />
        </div>
        <button className="p-3 text-white bg-rose-400">로그인</button>
        <div className="flex items-center justify-center w-full gap-4 text-gray-400">
          <Link href={'/auth/login/find/id'}>아이디 찾기</Link>
          <div className="w-0.5 h-3.5 bg-gray-300" />
          <Link href={'/auth/login/find/password'}>비밀번호 찾기</Link>
        </div>
        <SocialLogin />
        <button className="p-3 border text-rose-400 border-rose-400">
          회원가입
        </button>
      </div>
    </div>
  );
}
