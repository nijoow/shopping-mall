import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">THIS PAGE IS OUT OF THE EDIT.</span>
      <h1>
        404<span>.</span>
      </h1>
      <p>찾는 페이지가 없거나 공유 기간이 끝났어.</p>
      <Link className="button" href="/shop/all">
        컬렉션으로 돌아가기 ↗
      </Link>
    </div>
  );
}
