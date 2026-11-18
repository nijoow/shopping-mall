# 테스트 실행

저장소에 포함된 Yarn(`node .yarn/releases/yarn-4.0.2.cjs`)을 사용합니다.

| 명령 | 검사 내용 |
| --- | --- |
| `yarn check` | 타입, 린트, 단위 테스트, 모델 및 이미지 파일 검사 |
| `yarn check:full` | 기본 검사, 빌드, HTTP 및 브라우저 테스트 |
| `yarn test:http` | 임시 서버와 SQLite를 사용하는 API 테스트 |
| `yarn test:postgres` | PostgreSQL 저장, 동시 주문, 중복 환불, 디자인 충돌 테스트 |
| `yarn assets:check` | 상품 이미지, GLB 구조, 모델 버전과 재질 검사 |

HTTP 및 브라우저 테스트 실행 전에는 `yarn build`를 먼저 실행합니다. UI와 3D 변경 시에는 [브라우저 테스트](browser-verification.md)와 실제 화면 확인을 함께 진행합니다.

## PostgreSQL 테스트

1. 운영 DB와 분리한 빈 테스트 DB를 준비합니다.
2. 실행 시 `NIJOOW_POSTGRES_URL`을 지정해 `yarn db:setup`을 실행합니다.
3. 같은 DB를 `NIJOOW_TEST_POSTGRES_URL`에 지정해 `yarn test:postgres`를 실행합니다.

CI에서는 PostgreSQL 16 서비스 컨테이너를 사용하며, `main`과 `develop` 브랜치의 push 및 PR에서 검사를 실행합니다. 릴리스는 `package.json` 버전과 일치하는 `v*` 태그로 생성합니다.
