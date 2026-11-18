'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <span className="eyebrow">LET’S TRY THAT AGAIN.</span>
      <h1>화면을 불러오지 못했어.</h1>
      <p>저장된 데이터는 그대로야. 잠시 후 다시 시도해줘.</p>
      <button className="button" onClick={reset}>
        다시 불러오기
      </button>
    </div>
  );
}
