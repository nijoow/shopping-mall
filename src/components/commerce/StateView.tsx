'use client';
import Link from 'next/link';
import { useDemo } from './DemoProvider';
export function DataGuard({ children }: { children: React.ReactNode }) {
  const { loading, error, refresh } = useDemo();
  if (error)
    return (
      <section className="empty-state">
        <span className="eyebrow">CONNECTION</span>
        <h2>잠시 연결이 끊겼어.</h2>
        <p role="alert">{error}</p>
        <button className="button" onClick={() => void refresh()}>
          다시 불러오기
        </button>
      </section>
    );
  if (loading)
    return (
      <div className="loading-state" role="status">
        <span className="loading-line" />
        나의 공간을 준비하고 있어.
      </div>
    );
  return children;
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
