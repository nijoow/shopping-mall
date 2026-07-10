# NIJOOW 백로그

> 2026-07-10 blindspot pass에서 정리. 이번 라운드는 UI 완성에 집중했고,
> 아래 항목들은 별도 라운드에서 일괄 처리한다. (프로젝트 목적: 포트폴리오)

## P0 — 보안 (공개 배포 전 필수) ✅ 완료 (2026-07-11)

- [x] **`GET /api/users` 인증 추가** — ADMIN 세션 아니면 403. `src/app/api/users/route.ts`
- [x] **`(admin)` 라우트 가드** — 세션에 role을 싣고 레이아웃에서 ADMIN 검증 + role 값 정규화(소문자 'user'→'USER', 컬럼 기본값 포함) + 소유자 ADMIN 승격. `src/app/(admin)/layout.tsx`, `auth.ts`
- [x] **회원가입 API 정리** — 평문 비밀번호 응답 제거, zod 서버측 검증, 중복 이메일 409. `src/app/api/auth/sign-up/route.ts`
- [x] 로그인/중복확인 엔드포인트 rate limiting — 경량 in-memory. `src/lib/rateLimit.ts`

## P1 — 커머스 도메인 (기능 공백) ✅ 완료 (2026-07-11, 목업 결제까지)

- [x] **상품 옵션 모델**: products.sizes 컬럼 추가, 상세 페이지 사이즈 선택 실제 상태로
- [x] **장바구니 수량**: `Record<id,boolean>` → `CartItem[]({productId,quantity,size})` 확장 (localStorage 마이그레이션 포함)
- [x] **주문 도메인**: orders/order_items 테이블 + createOrder 트랜잭션(재고·포인트·스냅샷) + 체크아웃/완료 페이지 + 마이페이지 주문 내역
- [x] 포인트 적립 (주문 소계 1% 자동 적립) — *사용(차감)은 미구현*
- [ ] 상품 문의(Q&A) — 상세 페이지에 자리만 있음
- [ ] 관리자 상품 CRUD (현재 상품은 시드 데이터로만 존재)
- [ ] 주문 상태 전이(배송중/완료) + 주문 취소 (현재 PAID 고정)
- [ ] 포인트 사용(주문 시 차감)

## P2 — 인프라·품질

완료 (2026-07-11):
- [x] **소셜 로그인 계정 연결** — 이메일 기준으로 기존 계정에 연결(멀티 프로바이더), social_logins PK를 (user_id, type) 복합키로. `auth.ts`, `src/lib/database/user.ts`
- [x] 테스트/CI — PR에서 tsc/lint/build 게이트. `.github/workflows/ci.yml` (e2e 스모크는 아래 잔여)
- [x] route별 `error.tsx`(user/admin) + `global-error.tsx` + DB 헬퍼 에러 메시지
- [x] next-pwa 서비스워커 제거, manifest 유지(테마 브랜드화)
- [x] 미사용 의존성 제거: i18next 3종, uuid
- [x] **DB 스키마 일원화 착수** — drizzle.config + orders/order_items/social_logins/credentials pgTable 정의

잔여:
- [ ] **dev DB 분리** — 로컬 개발이 프로덕션 Vercel Postgres에 직접 연결됨. *Vercel 계정 필요.* 실행: Vercel 대시보드 → Storage에서 별도 Postgres(또는 브랜치 DB) 생성 → `.env.development.local`에 그 연결 문자열 → `next dev`가 dev DB를 쓰도록. 시드 스크립트를 dev DB에 재실행.
- [ ] **상품 이미지 자체 호스팅** — 현재 타사 핫링크(`http://bbbtan.cafe24.com`, http라 https 배포 시 mixed content). *Vercel Blob 토큰 필요.* 실행: `@vercel/blob` 설치 → 이미지 다운로드 후 `put()`으로 업로드 → products.imageUrl을 Blob URL로 UPDATE → next.config remotePatterns 정리. (진행 중: `public/images/products/*.png` 자체 에셋이 이미 추가되어 있음)
- [ ] **DB 스키마 일원화 마무리** — users/address도 drizzle pgTable로 이관 + 발견된 드리프트 수정: 실 DB엔 `birth`가 없고 `age`(int)가 있음 → `userSchema`/마이페이지 `PROFILE_FIELDS`가 존재하지 않는 `user.birth` 참조(항상 미입력 처리). gender는 char. drizzle-kit generate는 tsconfig target(es5) × drizzle-kit 0.20.x esbuild 충돌로 **drizzle-kit 버전 업** 후 가능.
- [ ] e2e 스모크 테스트 자동화 (현재는 수동 검증 스크립트: `scripts/verify-*.ts`)
- [ ] Modal 포커스 트랩 + Escape 닫기 (Search 모달은 됨)
- [ ] **3D 랩 스냅샷 버튼이 빈 이미지를 저장** — `preserveDrawingBuffer` 설정에도 캔버스 readback이 전부 투명. R3F 렌더 루프 안에서 `gl.render()` 직후 `toDataURL` 호출로 수정 필요. `src/app/(user)/3d-shop/_components/ControlPanel.tsx:58`

## 참고

- OAuth 소셜 로그인은 터널/프리뷰 URL에서 callback 불일치로 동작하지 않음 — 원격 데모는 credentials 로그인으로
- 3D 모델은 `shoe.glb` 하나뿐이라 상품 상세 3D 뷰어는 SHOES 카테고리에만 노출 (상품 colors를 파트에 근사 매핑)
- 검증 스크립트(`scripts/verify-order-flow.ts`, `verify-social-linking.ts`)는 프로덕션 DB에서 자기정리(self-cleaning)로 동작 — dev DB 분리 후엔 dev DB 대상으로 돌릴 것
