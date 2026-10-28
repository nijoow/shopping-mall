# 방문자 버전 전수 검토 및 리팩토링

기준일: 2026-10-28. 선택한 기능 기준은 `a4f4ad5836a1460b95e99813564e6ebde874aaa2`이며, 작업 위치는 `/tmp/shopping-mall-refactor-release`, 작업 브랜치는 `codex/refactor-visitor-release`입니다. 원본 체크아웃의 main(`eada387`)과 develop(`d416204`), 사용자 환경 파일·DB를 보존했습니다.

## 검토 기준과 변경

개인 `refactor-modern-frontend` 스킬의 본문 및 frontend/principles 참조 문서, 저장소 AGENTS와 하네스, 설치된 Next.js 16.3.4 문서를 읽고 적용했습니다. 여러 TSX 변경에는 React 검토 스킬을 함께 적용했습니다. 전체 lint/build 성공을 코드 검토의 대체 근거로 사용하지 않았습니다.

1. 주문 금액·배송비와 허용 상태 전이를 `src/domain/orders.ts`로 모았습니다. 장바구니, 결제 화면, 주문 화면과 서버가 같은 함수를 사용합니다. 서버의 소유권 확인·가격 재계산·재고 트랜잭션·중복 요청 처리는 유지했습니다. 기존 문구, 금액 경계, 취소/반품 가능 시점도 같습니다.
2. 스튜디오 localStorage 초안이 config만 검증하고 ID·이름·revision을 신뢰하던 경계를 보완했습니다. 잘못된 값은 기존 기본 초안으로 복구합니다. 편집 중 빈/미정리 이름, revision 생략 시 0, 저장된 구 모델 버전은 유지합니다. 서버 저장 계약은 변경하지 않았습니다.
3. 주문 배송→반품→환불, 손상된 초안 복구, runner v2 로딩 실패 및 실제 WebGL context loss 재시도 회귀 검증을 추가했습니다. 고의로 주입한 두 렌더러 오류는 정확한 메시지를 검증한 뒤 소비하며, 다른 브라우저 오류는 계속 실패 처리합니다.

새 기능·패키지 업그레이드·기계적 파일 분할·CSS/모델 변경은 수행하지 않았습니다.

## 전체 코드 영역 목록과 검토 결과

현재 활성 원본 53개(TS/TSX/CSS), 스크립트 8개, 테스트 9개를 영역별로 목록화했습니다. 다음 목록은 파일 존재 확인만이 아니라 각 영역의 호출 흐름·경계 검토에 사용했습니다.

### 앱 라우트·메타데이터

- `src/app/about/page.tsx`
- `src/app/api/demo/route.ts`
- `src/app/auth/[...path]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/designs/page.tsx`
- `src/app/error.tsx`
- `src/app/layout.tsx`
- `src/app/like/page.tsx`
- `src/app/my-page/page.tsx`
- `src/app/not-found.tsx`
- `src/app/opengraph-image.tsx`
- `src/app/orders/[orderId]/page.tsx`
- `src/app/page.tsx`
- `src/app/product/[productId]/page.tsx`
- `src/app/robots.ts`
- `src/app/share/[token]/opengraph-image.tsx`
- `src/app/share/[token]/page.tsx`
- `src/app/shop/[category]/page.tsx`
- `src/app/sitemap.ts`
- `src/app/studio/[model]/page.tsx`

### 쇼핑·편집·상태·복구

- `src/components/commerce/AccountOrders.tsx`
- `src/components/commerce/CartCheckout.tsx`
- `src/components/commerce/ConfirmDialog.tsx`
- `src/components/commerce/DemoProvider.tsx`
- `src/components/commerce/Header.tsx`
- `src/components/commerce/ProductCard.tsx`
- `src/components/commerce/ProductDetail.tsx`
- `src/components/commerce/SavedPages.tsx`
- `src/components/commerce/SharedDesign.tsx`
- `src/components/commerce/Shop.tsx`
- `src/components/commerce/StateView.tsx`
- `src/components/commerce/Studio.tsx`
- `src/components/commerce/client-api.ts`
- `src/components/commerce/useRetryDelay.ts`

### 3D 렌더링

- `src/components/three/ProductViewer.tsx`
- `src/components/three/ShoeCanvas.tsx`
- `src/components/three/materials.ts`

### 도메인·입력 계약

- `src/domain/catalog.ts`
- `src/domain/orders.ts`
- `src/domain/types.ts`
- `src/domain/validation.ts`

### 서버·저장·운영

- `src/server/data-backup.ts`
- `src/server/data-retention.ts`
- `src/server/database-config.ts`
- `src/server/database.ts`
- `src/server/guest-limits.ts`
- `src/server/repository.ts`

### 문구·스타일·폰트 연결

- `src/app/globals.css`
- `src/app/store.css`
- `src/content/copy.ts`
- `src/content/site.ts`
- `src/fonts/font.ts`

### 운영·검증·에셋 생성 스크립트

- `scripts/build-assets.py`
- `scripts/build-low-v2.py`
- `scripts/build-runner-quality.py`
- `scripts/check-assets.ts`
- `scripts/demo-data.ts`
- `scripts/setup-demo-database.ts`
- `scripts/test-http.mjs`
- `scripts/test-postgres.mjs`

### 회귀 테스트

- `tests/browser/commerce.spec.ts`
- `tests/browser/fixtures.ts`
- `tests/browser/global-setup.ts`
- `tests/client-api.test.ts`
- `tests/commerce.test.ts`
- `tests/data-operations.test.ts`
- `tests/http-smoke.mjs`
- `tests/model-version.test.ts`
- `tests/postgres.test.ts`

### 변경하지 않은 영역

- 라우트/SEO: 동적 param 검증, notFound, 기존 `/auth/*`의 query 없는 `/my-page` 전환, 인증 API 제거, 공유 metadata의 읽기 전용 스냅샷, canonical/robots/sitemap 흐름을 확인했습니다.
- 공통 UI/상태: DemoProvider의 요청 직렬화·상태 갱신·toast, client-api의 typed 오류/재시도, 429 대기, DataGuard, 확인 대화상자 초점 복귀를 검토했습니다. 상품 검색·정렬·필터, 찜/복제/삭제/공유, 편집 history·autosave·충돌 사본·PNG·장바구니 편집 흐름에 이번 배치의 추가 구조 변경은 필요하지 않았습니다.
- API/소유권: HttpOnly/Secure/SameSite 쿠키, 본문/Origin 검증, 공간별 서버 소유권 확인, 외부 ID의 404, 오류 코드와 Retry-After 계약을 유지했습니다. 예전 회원 계정 행은 보존하고 유효한 해당 공간 쿠키만 방문자로 전환합니다.
- 저장/운영: SQLite 쓰기 큐와 트랜잭션, PostgreSQL 독립 연결과 직렬화 재시도, immutable 주문/공유 payload, 만료/용량 제한, 보존용 계정 보호, 명시적 정리·백업·빈 DB 복원 조건을 검토했습니다. 이번 리팩토링에서 이 경계의 SQL/스키마/쿠키 동작은 변경하지 않았습니다.
- 3D: 버전별 asset 선택, clone material/texture의 격리·dispose, 각인 geometry, capture 준비/해제, GLTF 캐시 비우기·오류 boundary·context loss 복구를 검토했습니다. 생성 스크립트의 형상 생성·버전 출력 경로·기존 파일 덮어쓰기 차단도 읽었습니다. Blender로 자산을 재생성하지 않았습니다.
- 문구/CSS: 공통 토큰, 초점, 반응형 배치, overflow, reduced-motion, 제품/편집/주문 스타일 경계를 검토했습니다. CSS의 모든 픽셀 조합이나 모든 선택자의 사용 여부를 완전 검증했다는 의미는 아닙니다. 필요 없는 폰트·스타일 삭제나 전면 재배치는 하지 않았습니다.
- 설정: package/Yarn lock/.nvmrc, Next/TypeScript/ESLint/Playwright, CI·태그 릴리스 경로를 확인했습니다. CI는 main/develop PR에 격리 PostgreSQL·HTTP·브라우저 검사를 실행하며 배포 자체는 Vercel READY 및 실제 도메인을 따로 확인해야 합니다.

### 제외·미검증 영역

`archive/pre-editorial`, `docs/archive`는 AGENTS에 따라 활성 코드에서 제외했습니다. 폰트 바이너리·원본 GLB의 편집, 모든 문서의 교정, 실제 Safari/Android/iOS·스크린리더·저사양 GPU·모든 네트워크 조건은 검증하지 않았습니다. 두 모델의 기본 확대값에서 일부 측면/밑창/후면이 viewport 가장자리까지 확대되는 기존 동작을 확인했고, 이번 리팩토링에서 카메라 구성은 바꾸지 않았습니다.

## 실행한 검증

환경: macOS, Node v25.8.2, 고정 Yarn 4.0.2, Chromium/SwiftShader, 직접 만든 PostgreSQL 16 컨테이너. 설치는 immutable로 수행했으며 운영 URL을 테스트 변수로 사용하지 않았습니다.

| 검사                      | 결과/근거                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| typecheck / ESLint        | 통과                                                                                                                                  |
| 단위 테스트               | 28개 통과. 배송비 경계, 금액/상태 규칙, 손상된 초안·구 버전 호환 추가                                                                 |
| assets:check              | 상품 7종·버전 모델 5개·이미지 참조 12개 계약 통과                                                                                     |
| production build          | 통과. 삭제한 인증 API 없음, 기존 인증 UI 호환 redirect 유지                                                                           |
| 격리 HTTP                 | 통과. 방문자 격리/쿠키/Origin/이전 auth/잘못된 요청/응답 유실/중복 및 경쟁 주문/환불/초기화                                           |
| PostgreSQL 통합           | 통과. 독립 연결·동시 전환·소유권·충돌·재고·환불·429                                                                                   |
| 브라우저 회귀             | 전체 5개 통과. 의류 주문·배송/반품, low v3 편집/PNG/공유/주문, 실패/충돌 사본, runner v2 GLTF/context 복구, 잘못된 localStorage       |
| 합성 PostgreSQL 백업/복원 | PostgreSQL 16 도구로 custom archive를 별도 빈 DB에 실제 복원. 9개 테이블 전체 행·주문 payload·공유 modelVersion·보존용 계정 연결 일치 |
| 보조 화면                 | 1440/390 너비로 홈·카탈로그·검색/빈 상태·찜·디자인·내 공간·장바구니·소개·404, 필터 2/7개, 정렬, 이전 인증 URL 검증                    |
| 시각 검수                 | low v3 / runner v2 대표·측면·후면·밑창 및 커스텀 각인 캡처 직접 확인. 홈/모바일 내 공간/상품 목록/검색 빈 상태 캡처 확인              |

초기 브라우저 실패는 테스트가 잘못된 재시도 버튼 이름을 사용하고 의도된 R3F 오류를 예상하지 않은 원인이었습니다. 버튼 이름을 수정하고 고의 오류를 정확히 검증한 뒤 전체 5개를 재실행해 통과했습니다. PG14인 호스트 도구로 PG16을 덤프하지 않고 이미 설치된 Docker의 PG16 도구로 로컬 복원 검증을 수행했습니다.

캡처·임시 검증 스크립트는 Git 제외 `artifacts/browser/`, `artifacts/release-pages/`, `artifacts/verify-pg-backup.ts`에 있습니다. 캡처 생성과 실제 육안 검수 범위를 위 표에서 구분했습니다.

## 배포 준비 상태

- 원격 main은 `eada38703793e9b898325802c43630d0fc0ef753`로 재확인했습니다. 현재 운영은 같은 커밋의 Vercel `dpl_5taaVXn2h83jn7jQCN9jZ5UEnvXw`, 도메인은 `https://nijoow-shopping-mall.vercel.app`입니다.
- PR9의 원본 `fa75c1c`와 squash `79b8debe`는 같은 tree입니다. main의 변형은 CI/문서 9개이고 활성 앱은 같습니다. 후속 a4f4ad5의 변경은 이미 main에 있는 변경이 아닙니다.
- 운영 스키마를 READ ONLY 트랜잭션으로 점검했습니다. PostgreSQL 15.19, accounts/orders 0, workspaces 6, designs 2, shares 1이며 나머지 cart/favorites/inventory는 0입니다. `operation_limits`, `shares_expiry`, `workspace_expiry`는 없어 정상 배포 절차의 비파괴 `db:setup` 보완이 필요합니다.
- 예전 계정 데이터는 현재 운영에 없지만 선택한 버전의 계약은 같습니다: 같은 브라우저의 유효 쿠키로만 비공개 목록을 이어가며 쿠키 삭제/기기 변경/마지막 접근 7일 초과에는 계정 인증으로 복구하지 않습니다. 미전환 계정 행의 삭제·자동 cleanup은 없습니다.
- 운영 백업을 로컬 `artifacts/production-eada387-20261028.dump`(0600)에 저장하고 별도 로컬 DB에 복원하는 작업은 자동 승인 검토에서 거절되었습니다. 이유는 운영 데이터 payload의 로컬 반출·목적지에 대한 명시 승인 부족입니다. 해당 명령은 실행되지 않았으며 사용자 승인을 요청했습니다. 이를 우회하거나 재시도하지 않았습니다.
- 운영 백업/운영 스키마 변경/새 운영 배포는 아직 수행하지 않았습니다. 원격 CI·최종 커밋/배포 ID/도메인 검증은 완료된 시점에 별도 릴리스 증거로 기록합니다.
