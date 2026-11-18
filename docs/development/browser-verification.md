# 브라우저 테스트

```sh
node .yarn/releases/yarn-4.0.2.cjs exec playwright install chromium
node .yarn/releases/yarn-4.0.2.cjs build
node .yarn/releases/yarn-4.0.2.cjs test:browser
```

## 테스트 항목

- 일반 상품: 사이즈 선택 → 장바구니 → 모바일 모의 결제 → 주문 조회.
- 커스텀 상품: 3D 로드 → 색상·재질·각인 변경 → 저장·PNG·공유 → 주문 디자인 확인.
- 저장 실패: 네트워크 오류 후 재시도, 다른 창과의 편집 충돌, 사본 저장.
- 대화상자: 키보드 이동, Escape 닫기, 닫은 뒤 초점 복귀.

## 실행 환경

- Chromium, worker 1개, 재시도 없음.
- 임시 SQLite와 독립 Next 서버 사용. 기존 개발 서버나 운영 DB에 연결하지 않음.
- 각 테스트는 새 브라우저 context로 시작.
- 화면 너비 1440·1280·390px 사용.
- CI의 WebGL은 SwiftShader 사용. 실제 기기의 렌더링과 터치 동작은 별도 확인.

## 결과 파일

- HTML 보고서: `artifacts/browser/report`
- 실패 화면·trace·PNG: `artifacts/browser/test-results`
- 목록만 확인: `yarn exec playwright test --list`
