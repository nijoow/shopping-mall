# 환경 설정

## 로컬 설정

Node.js 버전은 [`.nvmrc`](../../.nvmrc), Yarn 버전과 실행 명령은 [package.json](../../package.json)을 기준으로 합니다. 저장소에 포함된 Yarn은 `node .yarn/releases/yarn-4.0.2.cjs`로 실행합니다.

환경 변수의 예시는 [`.env.example`](../../.env.example)에 있습니다. 필요한 값만 `.env.local`에 설정하며, 기존 파일과 데이터는 유지합니다. 로그인·OAuth 키는 필요하지 않습니다.

PostgreSQL 연결 설정이 없으면 `.data/editorial.sqlite`를 사용합니다. 데이터베이스 선택 순서와 테스트 격리는 [데이터 운영 문서](data-operations.md#연결-선택과-테스트-격리)를 참고합니다.

## 환경 변수

| 변수                             | 용도                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `NIJOOW_POSTGRES_URL`            | 앱의 PostgreSQL 연결. 로컬에서도 설정하면 PostgreSQL 사용                                  |
| `POSTGRES_URL`                   | Vercel에서 `NIJOOW_POSTGRES_URL`이 없을 때 사용할 연결                                     |
| `NIJOOW_APP_URL`                 | 선택 사항. 신뢰하는 프록시의 외부 앱 origin을 추가 허용. 미설정 시 요청의 Host origin 사용 |
| `NIJOOW_DEMO_DB_PATH`            | SQLite 파일 경로. 기본 `.data/editorial.sqlite`                                            |
| `NIJOOW_TEST_POSTGRES_URL`       | 통합 테스트 전용 PostgreSQL. 운영 DB와 분리                                                |
| `NIJOOW_OPERATIONS_POSTGRES_URL` | 정리·백업·복원 도구에서 명시적으로 선택하는 PostgreSQL 대상                                |

빈 PostgreSQL 연결 값은 미설정으로 처리합니다. Vercel에서는 `NIJOOW_POSTGRES_URL`과 `POSTGRES_URL`이 모두 비어 있으면 시작이 실패합니다.

## Cloud 개발

미리보기 연결에 외부 접근이 필요한 환경에서는 다음 명령을 사용합니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs dev --hostname 0.0.0.0 --port 3000
```

Cloud 개발 데이터의 지속적인 보관에는 PostgreSQL 사용을 권장합니다. 개발·테스트 DB는 운영 DB와 분리합니다.

## PostgreSQL 준비

Vercel 배포에는 PostgreSQL 연결이 필요합니다. 대상 연결을 확인한 뒤 최초 설정 또는 필요한 스키마 보완에 다음 명령을 사용합니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs db:setup
```

이 명령은 `nijoow_demo` 스키마에 테이블·인덱스를 생성합니다. 기존 테이블과 데이터를 초기화하지 않으며, `public` 테이블과 로컬 SQLite 데이터는 자동으로 이전하지 않습니다. `operation_limits`를 포함한 앱 스키마가 준비되어 있어야 합니다.

테스트용 PostgreSQL 실행은 [하네스](harness.md#postgresql-테스트), 데이터 정리·백업·새 DB 복원은 [데이터 운영](data-operations.md)을 참고합니다.
