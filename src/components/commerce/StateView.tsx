'use client';
import { SERVICE_COPY } from '@/content/copy';
import Link from 'next/link';
import { errorMessage } from './client-api';
import { useState } from 'react';
import { useRetryDelay } from './useRetryDelay';
import { useDemo } from './DemoProvider';
export function DataGuard({ children }: { children: React.ReactNode }) {
  const { loading, error, refresh, state } = useDemo();
  const [retrying, setRetrying] = useState(false);
  const retryDelay = useRetryDelay(error);
  if (error && !state)
    return (
      <section className="empty-state">
        <span className="eyebrow">PLEASE TRY AGAIN</span>
        <h2>{SERVICE_COPY.loadFailed}</h2>
        <p role="alert">{errorMessage(error)}</p>
        <button
          className="button"
          disabled={retrying || retryDelay > 0}
          onClick={async () => {
            setRetrying(true);
            await refresh();
            setRetrying(false);
          }}
        >
          {retrying
            ? '불러오는 중…'
            : retryDelay
              ? `${retryDelay}초 후 다시 시도`
              : '다시 불러오기'}
        </button>
      </section>
    );
  if (loading)
    return (
      <div className="loading-state" role="status">
        <span className="loading-line" />
        {SERVICE_COPY.loading}
      </div>
    );
  return (
    <>
      {error && (
        <p className="notice-box" role="alert">
          {errorMessage(error)}{' '}
          <button
            className="text-link"
            disabled={retrying || retryDelay > 0}
            onClick={async () => {
              setRetrying(true);
              await refresh();
              setRetrying(false);
            }}
          >
            {retrying
              ? '불러오는 중…'
              : retryDelay
                ? `${retryDelay}초 후 다시 시도`
                : '다시 불러오기'}
          </button>
        </p>
      )}
      {children}
    </>
  );
}
export function EmptyState({
  title,
  text,
  href = '/shop/all',
  action = '쇼핑하러 가기',
}: {
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <section className="empty-state">
      <span className="eyebrow">YOUR NEXT EDIT</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button" href={href}>
        {action} ↗
      </Link>
    </section>
  );
}
