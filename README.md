# NIJOOW — Editorial 3D Store

패션 매거진형 UI에서 스니커즈를 3D로 편집하고, 디자인을 저장·공유·모의 주문하는 포트폴리오야. 실제 결제와 배송은 발생하지 않아.

현재는 **첫 로컬 실행 버전**이야. 전체 제품이 최종 완성됐다는 뜻은 아니고, 모델의 조형/표면 개선과 실제 소셜 로그인·배포 환경 검증이 남아 있어.

## 실행

Node.js 22.13 이상이 필요해. 로컬에서는 Node의 SQLite를 사용하고, Cloud에서는 PostgreSQL 어댑터를 선택할 수 있어. Vercel에서는 PostgreSQL을 사용해.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
node .yarn/releases/yarn-4.0.2.cjs dev --port 3100
```

브라우저에서 `http://127.0.0.1:3100`을 열면 돼. 비로그인 데모는 소셜 제공자 설정 없이도 체험할 수 있어. 데이터는 기본적으로 `.data/editorial.sqlite`에 저장되고 Git에는 포함되지 않아.

소셜 로그인은 기존 카카오·네이버·구글 제공자를 사용해. `.env.example`의 변수명을 참고하되 기존 `.env.local`을 덮어쓰지 않아야 해. 제공자 콘솔의 callback URL은 실행 주소의 `/api/auth/callback/kakao`, `/api/auth/callback/naver`, `/api/auth/callback/google`과 일치해야 해. 실제 인증 성공은 별도로 확인해야 해.

## 검증

```sh
node .yarn/releases/yarn-4.0.2.cjs test
node .yarn/releases/yarn-4.0.2.cjs typecheck
node .yarn/releases/yarn-4.0.2.cjs lint
node .yarn/releases/yarn-4.0.2.cjs build
# 로컬 서버가 실행 중일 때 별도 테스트 공간으로 실제 HTTP 흐름 검증
node .yarn/releases/yarn-4.0.2.cjs test:http
```

HTTP 테스트는 localhost/127.0.0.1에서만 실행하도록 제한돼 있어. 주문·재고·계정 이관 단위 테스트는 독립된 메모리 DB를 사용해.

## 구현한 흐름

- 매거진형 홈, 스니커즈·의류·잡화 목록, 검색·정렬·3D 필터.
- 상세의 기본 3D, 전체 화면 편집, 4개 부위 색, 어퍼 재질, 각인, Undo/Redo, 비교·확대·시점 전환.
- 서버 디자인 저장, 충돌 검증, 복제·공유, 이미지 내보내기.
- 일반/커스텀 장바구니, 수량·선택 주문, 장바구니 디자인 수정, 바로 주문.
- 가상 배송지, 모의 승인·실패·응답 유실 복구, 주문 중복 방지와 원자적 재고 차감.
- 주문 당시 구성의 3D 다시 보기, 배송 진행·취소·반품·모의 환불.
- 데모/소셜 계정 경계, 익명 디자인·찜·장바구니·주문의 계정 이관.
- 주문·장바구니 초기화 시 디자인·찜 보존.

## 에셋과 현재 한계

러너는 Shopify의 Materials Variants Shoe(CC BY 4.0)를 가공한 자산이야. 원본 출처와 변경 내용은 `/about`과 `public/models/source/shopify-source.md`에 있어. 로우탑은 Blender/Python으로 직접 제작한 모델이야. 재킷·니트·가방의 2D 이미지는 built-in image_gen으로 제작한 가상 제품 이미지이며 생성 프롬프트를 문서에 남겼어.

모델·부품 교체의 최종 품질은 아직 검수 중이야. 현재는 색·재질·각인 기능을 먼저 연결했고, 부품 형태 교체는 제공하지 않아. 실제 iOS/Android 기기의 성능도 아직 검증하지 않았어.

macOS의 Blender로 스니커즈 에셋을 다시 만들려면:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/build-assets.py -- runner low
```

SQLite는 로컬 또는 지속 디스크가 있는 단일 서버에서 사용해. Vercel 배포에서는 `NIJOOW_POSTGRES_URL` 또는 기존 `POSTGRES_URL`을 사용해. 모든 새 테이블은 `nijoow_demo` 스키마에 만들어 기존 public 테이블과 분리해. 로컬의 기존 SQLite 데이터는 자동으로 원격에 복사되지 않아.

## Cloud 실행과 환경 변수

연결한 Cloud 작업의 예전 Next.js 14 설정 대신 이 브랜치를 사용해야 해. Node 22.13 이상과 저장소의 Yarn 4를 사용해.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
# PostgreSQL을 사용한다면 선택한 DB에 최초 1회 실행
node .yarn/releases/yarn-4.0.2.cjs db:setup
node .yarn/releases/yarn-4.0.2.cjs dev --hostname 0.0.0.0 --port 3000
```

| 변수                                   | 용도                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                          | 세션 서명용 비밀값. 배포·재시작 사이에 같은 값을 유지해.                                                  |
| `AUTH_URL`                             | 로그인 콜백과 요청 origin 검증에 사용하는 실제 HTTPS 실행 주소. 개발은 해당 미리보기 주소 또는 로컬 주소. |
| `AUTH_TRUST_HOST`                      | 신뢰하는 프록시 뒤에서 `true`. Vercel은 자동으로 신뢰해.                                                  |
| `NIJOOW_POSTGRES_URL`                  | Cloud에서 PostgreSQL을 선택하는 암호화 연결 문자열. Vercel도 이 값을 우선 사용해.                         |
| `POSTGRES_URL`                         | Vercel에서 위 변수가 없을 때 사용하는 기존 DB 연결 변수.                                                  |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | 구글 로그인 키.                                                                                           |
| `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`   | 카카오 로그인 키.                                                                                         |
| `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`   | 네이버 로그인 키.                                                                                         |
| `NIJOOW_DEMO_DB_PATH`                  | SQLite를 선택했을 때 파일 경로. 영구 디스크가 없으면 데이터도 유지되지 않아.                              |

소셜 로그인 키 없이 게스트 데모를 검증할 수 있어. 세 소셜 로그인을 모두 사용하려면 세 제공자의 키 쌍을 모두 설정해야 해. 비밀값은 Cloud/Vercel 환경 설정에 넣고 Git이나 메시지에 기록하지 않아. API 키에 `NEXT_PUBLIC_` 접두사를 붙이지 않아.

Vercel의 `POSTGRES_URL`이 이미 연결돼 있으면 새 서비스를 만들 필요가 없어. `db:setup`은 데모 스키마만 생성하고 기존 테이블을 변경하지 않아. 트랜잭션은 같은 연결에서 실행하고 충돌은 제한적으로 재시도해. 연결 간 저장, 동시 주문·환불·디자인 수정은 `tests/postgres.test.ts`로 별도 검증해.

배포 후 로그인 제공자 콘솔에 `AUTH_URL`의 `/api/auth/callback/google`, `/api/auth/callback/kakao`, `/api/auth/callback/naver`를 등록해야 해. 실제 OAuth 로그인은 해당 콜백을 등록한 주소에서 검증해야 해.

이전 구현은 `archive/pre-editorial`에 보존돼 있고 현재 라우트·타입 검사·린트 대상에서 제외했어. 이전 가입/관리자 API는 새 앱에서 사용하지 않아.

## 기획과 작업 기록

- `docs/planning/3d-commerce-portfolio.md`: 확정한 제품 범위와 후속 기능.
- `docs/planning/desktop-experience-spec.md`: 데스크톱 중심 화면 명세.
- `docs/implementation/2026-09-10-checkpoint.md`: 이번 구현·검증과 남은 작업.
