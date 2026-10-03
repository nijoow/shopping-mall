'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowUpRight } from 'lucide-react';
import type { SocialProvider } from '../../../auth.providers';

export function Login({
  callbackUrl,
  errorCode,
  enabledProviders,
}: {
  callbackUrl: string;
  errorCode?: string;
  enabledProviders: SocialProvider[];
}) {
  const [pending, setPending] = useState(''),
    [error, setError] = useState(
      errorCode === 'AccessDenied'
        ? '로그인이 취소되었거나 필요한 동의가 완료되지 않았습니다. 다시 시도하거나 로그인 없이 계속할 수 있습니다.'
        : errorCode
          ? '소셜 로그인을 완료하지 못했습니다. 다시 시도하거나 로그인 없이 체험을 계속해 주세요.'
          : '',
    );
  useEffect(() => {
    const returned = () => setPending('');
    window.addEventListener('pageshow', returned);
    return () => window.removeEventListener('pageshow', returned);
  }, []);
  return (
    <div className="login-page">
      <section className="login-intro">
        <span className="eyebrow">YOUR EDIT, EVERYWHERE.</span>
        <h1>
          KEEP
          <br />
          YOUR
          <br />
          PERSPECTIVE<span>.</span>
        </h1>
        <p>
          내가 만든 디자인, 골라둔 아이템,
          <br />
          주문한 스니커즈까지 한곳에.
        </p>
      </section>
      <section className="login-panel">
        <span className="eyebrow">WELCOME TO NIJOOW</span>
        <h2>로그인하고 내 컬렉션을 이어가세요.</h2>
        <p>
          로그인하면 체험 중인 디자인·찜·장바구니·주문이 계정에 함께 보관됩니다.
        </p>
        <div className="social-buttons">
          {[
            { id: 'kakao', label: '카카오로 계속하기', icon: 'K' },
            { id: 'naver', label: '네이버로 계속하기', icon: 'N' },
            { id: 'google', label: 'Google로 계속하기', icon: 'G' },
          ].map(provider => (
            <button
              key={provider.id}
              className={`social-button ${provider.id}`}
              disabled={
                !!pending ||
                !enabledProviders.includes(provider.id as SocialProvider)
              }
              onClick={async () => {
                setPending(provider.id);
                setError('');
                try {
                  await signIn(provider.id, { redirectTo: callbackUrl });
                } catch {
                  setError('로그인을 시작하지 못했습니다. 다시 시도해 주세요.');
                  setPending('');
                }
              }}
            >
              <span>{provider.icon}</span>
              {!enabledProviders.includes(provider.id as SocialProvider)
                ? `${provider.label} · 이용 불가`
                : pending === provider.id
                  ? '로그인 연결 중…'
                  : provider.label}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        {enabledProviders.length < 3 && (
          <p className="option-help">
            일부 소셜 로그인을 현재 이용할 수 없습니다. 로그인 없이도 디자인과
            주문 과정을 체험할 수 있습니다.
          </p>
        )}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <Link href={callbackUrl} className="button outline">
          로그인 없이 계속 체험하기
        </Link>
        <p className="demo-caption">
          소셜 서비스별로 계정을 구분합니다.
          <br />
          로그인 후에도 실제 결제와 배송은 진행되지 않습니다.
        </p>
      </section>
    </div>
  );
}
