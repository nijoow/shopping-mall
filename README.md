# NIJOOW — Editorial 3D Store

스니커즈를 3D로 편집하고 의류·잡화와 함께 저장·공유·모의 주문하는 포트폴리오야. 실제 결제와 배송은 발생하지 않아.

2026-09-30에 [PR #9](https://github.com/nijoow/shopping-mall/pull/9)를 통해 운영에 반영했어(`79b8deb`). [운영 사이트](https://nijoow-shopping-mall.vercel.app)의 현재 배포 상태는 Vercel에서 따로 확인해. 3D 조형 완성도·실제 OAuth 완주·모바일 실기기 검수는 후속 범위야.

## 실행

Node **22.13 이상**, 권장 기준은 [`.nvmrc`](.nvmrc)의 Node 22야. Yarn 4.0.2는 저장소에 포함돼 있어.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
node .yarn/releases/yarn-4.0.2.cjs dev
```

기본 주소는 `http://127.0.0.1:3000`. 기존 `.env.local`을 덮어쓰지 마. 소셜 키 없이 게스트 데모를 사용할 수 있고, 로컬 데이터는 기본적으로 `.data/editorial.sqlite`에 저장돼.

## 검증

```sh
# 타입 생성·타입 검사·린트·단위 테스트·에셋 계약
node .yarn/releases/yarn-4.0.2.cjs check
# 위 검사 + 빌드 + 임시 서버/SQLite에서 실제 HTTP 커머스 검증
node .yarn/releases/yarn-4.0.2.cjs check:full
```

`test:http`는 준비된 빌드를 사용해 전용 임시 서버를 띄우고 종료 시 서버와 DB를 정리해. 기존 개발 서버나 3100 포트를 준비할 필요가 없어. PostgreSQL 테스트는 기본 단위 테스트와 분리했어. 별도 테스트 DB에 `NIJOOW_TEST_POSTGRES_URL`을 설정한 뒤 `test:postgres`로 실행해. 자세한 절차와 검증 범위는 [하네스](docs/development/harness.md)에 있어.

## Cloud와 환경 변수

현재 `main`과 저장소의 Yarn을 사용해. Cloud 개발 서버는 다음처럼 외부 미리보기 연결을 허용해.

```sh
node .yarn/releases/yarn-4.0.2.cjs dev --hostname 0.0.0.0 --port 3000
```

| 변수                                   | 용도                                                             |
| -------------------------------------- | ---------------------------------------------------------------- |
| `AUTH_SECRET`                          | 인증 세션 서명. 배포·재시작 사이에 같은 비밀값 유지              |
| `AUTH_URL`                             | 해당 실행 환경의 실제 URL. 운영은 HTTPS                          |
| `AUTH_TRUST_HOST`                      | 신뢰하는 프록시에서 `true`; Vercel은 자동 신뢰                   |
| `NIJOOW_POSTGRES_URL`                  | Cloud PostgreSQL 연결. 로컬에서도 이 값이 있으면 PostgreSQL 사용 |
| `POSTGRES_URL`                         | Vercel에서 위 변수가 없을 때 쓰는 기존 연결 변수                 |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | 구글 로그인                                                      |
| `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`   | 카카오 로그인                                                    |
| `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`   | 네이버 로그인                                                    |
| `NIJOOW_DEMO_DB_PATH`                  | SQLite 파일 경로. 기본 `.data/editorial.sqlite`                  |
| `NIJOOW_TEST_POSTGRES_URL`             | 통합 테스트 전용 DB. 운영 연결과 분리                            |

설정 예시는 [`.env.example`](.env.example). 사용하지 않는 PostgreSQL 변수는 빈 값으로 등록하기보다 생략해. 현재 Vercel fallback은 변수의 **부재**를 기준으로 동작해.

PostgreSQL은 `nijoow_demo` 스키마를 사용해. 선택한 새 DB에 최초 한 번 `node .yarn/releases/yarn-4.0.2.cjs db:setup`을 실행해. 이 명령은 실제 DB에 스키마를 생성하므로 대상 연결부터 확인해. 기존 public 테이블과 로컬 SQLite 데이터는 자동 이전하지 않아. 개발·테스트는 운영과 다른 DB를 사용해.

소셜 로그인을 사용하는 환경의 제공자 콘솔에 다음 callback을 등록해. 제공자 목록 조회 성공과 실제 로그인 완료는 별개야.

- `/api/auth/callback/google`
- `/api/auth/callback/kakao`
- `/api/auth/callback/naver`

## 구현 범위와 에셋

- 매거진형 홈·목록·상세, 검색·정렬·카테고리·찜.
- 3D 색상·재질·각인, 전체 화면 편집, Undo/Redo, 저장·복제·공유·PNG.
- 일반/커스텀 장바구니, 모의 결제·배송·취소·반품·환불.
- 소유권 분리, 주문 중복 방지, 게스트 데이터의 소셜 계정 이관.
- 실제 결제, 문의·후기, 별도 관리자, 부품 형태 교체는 제공하지 않아.

러너는 Shopify CC BY 4.0 모델을 가공했고 로우탑은 직접 제작했어. 의류·잡화 이미지는 가상 제품을 위해 제작했어. [출처](public/models/source/shopify-source.md)와 [프롬프트 기록](docs/planning/product-image-prompts-2026-09-21.md)을 보관해.

`assets:check`는 파일·모델 버전·편집 재질의 연결만 검사해. 모양과 조작 품질은 화면에서 확인해야 해. 기존 제작 스크립트는 v1/v2 파일을 고정 경로에 출력하므로 보존된 모델을 무심코 재생성하지 마. 새 제작 작업은 다음 모델 버전의 출력 경로부터 정해.

## 작업 안내

- [현재 백로그](BACKLOG.md) → [다음 작업 계획](docs/planning/next-steps.md)
- [사이트 문구 교체 계획](docs/planning/ui-copy.md)
- [에이전트 작업 규칙](AGENTS.md) · [실행·검증 하네스](docs/development/harness.md)
- [문서 색인](docs/README.md)

`archive/`는 이전 소스, `docs/archive/`와 날짜가 붙은 구현 기록은 과거 증거야. 현재 동작은 `src/`, 테스트, 실행 결과를 기준으로 판단해.
