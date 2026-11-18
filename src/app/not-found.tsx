import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">THIS PAGE IS OUT OF THE EDIT.</span>
      <h1>
        404<span>.</span>
      </h1>
      <p>
        페이지를 찾을 수 없습니다. 공유 링크는 유효기간이 끝났을 수 있습니다.
      </p>
      <Link className="button" href="/shop/all">
        컬렉션으로 돌아가기 ↗
      </Link>
    </div>
  );
}
