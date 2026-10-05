# NIJOOW — Editorial 3D Store

스니커즈를 3D로 편집하고 의류·잡화와 함께 저장·공유·모의 주문하는 포트폴리오입니다. 실제 결제와 배송은 발생하지 않습니다.

2026-09-30에 [PR #9](https://github.com/nijoow/shopping-mall/pull/9)를 통해 운영에 반영했습니다(`79b8deb`). [운영 사이트](https://nijoow-shopping-mall.vercel.app)의 현재 배포 상태는 Vercel에서 별도로 확인해야 합니다. 로컬 구현과 운영 배포는 구분하며, 현재 우선순위는 [다음 작업 계획](docs/planning/next-steps.md)을 참고합니다.

## 실행

Node **22.13 이상**이 필요합니다. 권장 기준은 [`.nvmrc`](.nvmrc)의 Node 22이며, Yarn 4.0.2는 저장소에 포함되어 있습니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
node .yarn/releases/yarn-4.0.2.cjs dev
```

기본 주소는 `http://127.0.0.1:3000`입니다. 기존 `.env.local`은 덮어쓰지 않습니다. 로그인 없이 방문자별 체험을 사용할 수 있으며, 로컬 데이터의 기본 경로는 `.data/editorial.sqlite`입니다.

## 검증

```sh
# 타입 생성·타입 검사·린트·단위 테스트·에셋 계약
node .yarn/releases/yarn-4.0.2.cjs check
# 위 검사 + 빌드 + 격리 HTTP 검증 + 핵심 브라우저 3개 흐름
node .yarn/releases/yarn-4.0.2.cjs check:full
```

`test:browser` 실행 전 `node .yarn/releases/yarn-4.0.2.cjs exec playwright install chromium`으로 브라우저를 설치합니다.

`test:http`는 준비된 빌드로 전용 임시 서버를 시작하고 종료 시 서버와 DB를 정리합니다. 기존 개발 서버를 사용하지 않습니다. PostgreSQL 통합 테스트는 기본 단위 테스트와 분리되어 있습니다. 별도 테스트 DB에 `NIJOOW_TEST_POSTGRES_URL`을 설정한 뒤 `test:postgres`로 실행합니다. 자세한 절차와 검증 범위는 [하네스](docs/development/harness.md)를 참고합니다.

## Cloud와 환경 변수

실행할 커밋/브랜치를 선택하고 저장소의 Yarn을 사용합니다. Cloud 개발 서버는 다음 명령으로 외부 미리보기 연결을 허용합니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs dev --hostname 0.0.0.0 --port 3000
```

| 변수                             | 용도                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NIJOOW_POSTGRES_URL`            | Cloud PostgreSQL 연결. 로컬에서도 이 값이 있으면 PostgreSQL 사용                                  |
| `POSTGRES_URL`                   | Vercel에서 위 변수가 없을 때 쓰는 기존 연결 변수                                                  |
| `NIJOOW_APP_URL`                 | 선택 사항. 신뢰하는 프록시의 외부 앱 origin을 추가 허용. 일반 로컬/Vercel 요청은 Host origin 사용 |
| `NIJOOW_DEMO_DB_PATH`            | SQLite 파일 경로. 기본 `.data/editorial.sqlite`                                                   |
| `NIJOOW_TEST_POSTGRES_URL`       | 통합 테스트 전용 DB. 운영 연결과 분리                                                             |
| `NIJOOW_OPERATIONS_POSTGRES_URL` | 정리·백업·복원 도구에 명시하는 별도 운영 대상                                                     |

설정 예시는 [`.env.example`](.env.example)에 있습니다. 빈 PostgreSQL 설정은 미설정으로 처리합니다. Vercel은 비어 있지 않은 `NIJOOW_POSTGRES_URL`을 우선 사용하고, 없으면 `POSTGRES_URL`로 연결합니다.

PostgreSQL은 `nijoow_demo` 스키마를 사용합니다. 선택한 새 DB에 최초 한 번 `node .yarn/releases/yarn-4.0.2.cjs db:setup`을 실행합니다. 실제 DB에 스키마를 생성하는 명령이므로 실행 전에 대상 연결을 확인해야 합니다. 기존 public 테이블과 로컬 SQLite 데이터는 자동으로 이전되지 않습니다. 개발·테스트는 운영과 다른 DB를 사용합니다.

OAuth·계정 연동은 제공하지 않습니다. `AUTH_*` 설정과 제공자 callback 등록은 필요하지 않습니다. 기존 `.env.local` 값은 자동으로 삭제하지 않으며 현재 코드에서 사용하지 않습니다.

## 구현 범위와 에셋

- 매거진형 홈·목록·상세, 검색·정렬·카테고리·찜.
- 3D 색상·재질·각인, 전체 화면 편집, Undo/Redo, 저장·복제·공유·PNG.
- 일반/커스텀 장바구니, 모의 결제·배송·취소·반품·환불.
- 브라우저 쿠키별 소유권 분리, 새로고침 후 저장 내역 유지, 주문 중복 방지.
- 실제 결제, 로그인·기기 간 동기화, 문의·후기, 별도 관리자, 부품 형태 교체는 제공하지 않습니다.

`/my-page`는 **내 공간**입니다. 쿠키를 삭제하거나 브라우저·기기를 바꾸면 기존 비공개 목록에 접근할 수 없습니다. 마지막 공간 접근 후 7일 초과 시 접근이 만료됩니다. 공유 링크는 발행 후 7일간 읽기 전용 디자인을 표시하며 PNG 내보내기도 지원합니다. 접근 만료와 물리 삭제 시점은 다르며, 자동 정리 스케줄은 등록하지 않았습니다.

러너는 Shopify CC BY 4.0 모델을 가공했으며 로우탑은 직접 제작했습니다. 의류·잡화 이미지는 가상 제품을 위해 제작했습니다. [출처](public/models/source/shopify-source.md)와 [프롬프트 기록](docs/planning/product-image-prompts-2026-09-21.md)을 보관합니다.

`assets:check`는 파일·모델 버전·편집 재질의 연결만 검사합니다. 모양과 조작 품질은 실제 화면에서 확인해야 합니다. 제작 스크립트는 명시적인 새 출력 경로가 필요하며 기존 파일 덮어쓰기를 거부합니다. 현재 기본 모델은 runner v2 / low v3이고 이전 버전도 유지합니다. 자세한 명령은 [3D 검증 기록](docs/implementation/2026-10-03-3d-quality.md)을 참고합니다.

## 작업 안내

- [현재 백로그](BACKLOG.md) → [다음 작업 계획](docs/planning/next-steps.md)
- [사이트 문구 교체 계획](docs/planning/ui-copy.md)
- [에이전트 작업 규칙](AGENTS.md) · [실행·검증 하네스](docs/development/harness.md)
- [문서 색인](docs/README.md)

`archive/`는 이전 소스이며, `docs/archive/`와 날짜가 붙은 구현 기록은 작성 시점의 증거입니다. 현재 동작은 `src/`, 테스트, 실행 결과를 기준으로 판단합니다.

## 데이터 운영과 시연

- [운영 도구](docs/development/data-operations.md): 범위를 제한한 만료 정리, SQLite/PostgreSQL 백업·새 DB 복원 절차입니다. 실제 운영 DB 작업은 별도 대상 확인 후 실행합니다. 새 배포 전 `operation_limits`를 포함한 `db:setup` 적용이 필요합니다.
- [브라우저 검증](docs/development/browser-verification.md): 일반 상품 주문, 3D 저장·공유·주문, 저장 실패/충돌/429 복구의 세 시나리오.
- [75초 시연 가이드](docs/portfolio/demo-guide.md)와 [방문자 체험 전환 기록](docs/implementation/2026-10-05-visitor-only.md).
