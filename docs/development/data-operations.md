# 공개 데모 데이터 운영

## 연결 선택과 테스트 격리

`src/server/database-config.ts`에서 URL·파일 경로·Cloud 표시의 앞뒤 공백을 제거하고 빈 문자열을 미설정으로 취급한다.

| 실행 환경                          | 선택 순서                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| 로컬                               | 비어 있지 않은 `NIJOOW_POSTGRES_URL` → `NIJOOW_DEMO_DB_PATH` → `.data/editorial.sqlite`             |
| Vercel (`VERCEL`이 비어 있지 않음) | `NIJOOW_POSTGRES_URL` → `POSTGRES_URL`; 둘 다 비면 시작 실패                                        |
| 격리 HTTP 테스트                   | `NIJOOW_TEST_SQLITE_ONLY=1` + 명시적 임시 `NIJOOW_DEMO_DB_PATH`; Cloud/일반 PostgreSQL 설정 무시    |
| PostgreSQL 통합 테스트             | `NIJOOW_TEST_POSTGRES_URL`만 직접 사용; 일반 앱 URL을 대체값으로 사용하지 않음                      |
| 아래 운영 도구                     | 명시적 `--sqlite 파일` 또는 `--postgres` + `NIJOOW_OPERATIONS_POSTGRES_URL`; `.env*` 자동 로드 없음 |

Cloud에서 SQLite로 조용히 대체하지 않는다. 테스트는 전용 URL이나 생성한 임시 파일만 사용한다. SQLite 명시적 경로가 없는 격리 모드는 실패한다.

PostgreSQL에는 `operation_limits` 테이블 및 만료 검색 인덱스가 추가되었다. 새 코드 배포 전 **대상 연결을 확인한 뒤** 기존 `db:setup`을 실행해야 한다. `CREATE ... IF NOT EXISTS`로 기존 디자인·주문과 `public` 스키마를 유지한다. 로컬 SQLite는 앱 시작 시 같은 스키마를 생성한다. 이번 작업에서는 운영 스키마 변경·정리·배포를 실행하지 않았다.

## 익명 생성·저장·공유 제한

`src/server/guest-limits.ts`의 고정 창 카운터를 같은 데이터베이스의 트랜잭션 안에서 갱신한다. PostgreSQL은 SERIALIZABLE 및 충돌 재시도, SQLite는 기존 쓰기 큐와 `BEGIN IMMEDIATE`를 사용한다. 프로세스 메모리·서버리스 인스턴스 수에 의존하지 않는다.

| 범위                  | 제한                                                            |
| --------------------- | --------------------------------------------------------------- |
| 게스트 공간 신규 생성 | DB 전체 10분당 120개, 최대 5,000개 공간                         |
| 게스트 디자인 저장    | 공간별 분당 30회, 기존 공간별 50개, 전체 게스트 디자인 25,000개 |
| 게스트 공유 링크 생성 | 공간별 분당 10회, 공간별 50개 링크, 전체 게스트 링크 25,000개   |

카운터 키는 작업명과 무작위 공간 ID 또는 하나의 생성 전역 키뿐이다. IP·IP 해시·사용자 에이전트를 수집하거나 저장하지 않는다. 기존 공간 조회에는 제한 카운터를 추가하지 않는다. 저장·공유는 전역 카운터를 사용하지 않아 정상 편집을 하나의 전역 행으로 직렬화하지 않는다. 유효한 새 공간 생성에만 전역 카운터를 적용한다.

실패한 트랜잭션은 카운터와 디자인/공유 생성 모두 롤백한다. 제한 응답은 `429`, `RATE_LIMITED` 또는 `DEMO_CAPACITY`, `Retry-After` 및 JSON `retryAfter`(초)로 전달한다. 기존 저장본·주문·공유 스냅샷은 유지된다. 용량 제한의 600초는 재시도 간격이며 정리 완료나 공간 확보를 약속하지 않는다. 회원은 익명 제한 대상이 아니며 기존 디자인 50개 제한은 유지한다.

고정 창 경계에서는 짧은 시간에 두 창의 허용량을 사용할 수 있다. IP별 제한이 아니므로 악의적인 새 공간 생성이 전체 생성 예산을 차지할 수 있다. 프록시/WAF나 계정별 제한을 대신하지 않는다. 만료 링크도 실제 정리 전에는 용량에 포함된다. 이 제한은 익명 생성·저장·공유 범위이며 요청당 본문 제한, 장바구니 소유권, 주문 중복·재고 원자성 검증은 기존 경로를 유지한다.

## 만료와 물리 정리

- 게스트는 마지막 공간 접근으로부터 **7일 초과**하면 기존 토큰으로 조회/계정 이관하지 못한다. 정확히 7일 경계는 유지한다.
- 공유 링크는 `expires_at` 시각부터 조회되지 않는다. 원본 디자인 수정과 별개로 생성 시 `config.modelVersion`을 포함한 스냅샷을 보관한다.
- 조회 거절과 물리 삭제는 별개다. 자동 정리 스케줄은 등록하지 않았다.
- 정리는 만료 공유와 비회원 공간만 대상으로 한다. 회원 디자인·주문·계정과 모델 파일은 삭제하지 않는다. 게스트 공간에 살아 있는 공유가 있으면 보류한다. 한 번의 계획에서 공유 최대 100개, 공간 최대 100개만 선택한다.

먼저 아래처럼 dry-run 파일을 만든다. 이 단계는 SQLite를 읽기 전용으로 연다. PostgreSQL에는 조회만 수행한다. 대상의 ID·관측 시각, DB 식별 해시가 기록되고 저장본·주문 payload나 쿠키 해시는 포함하지 않는다. 계획 파일은 0600 권한으로 새로 만들며 기존 파일을 덮어쓰지 않는다.

```sh
node --import tsx scripts/demo-data.ts cleanup --sqlite /absolute/path/demo.sqlite --plan /private/tmp/nijoow-retention.json --batch 50
```

목록의 DB와 대상, 백업 상태를 확인한 다음 같은 파일로 명시적으로 실행한다. 운영 대상 실행은 별도 승인된 작업으로 수행한다.

```sh
node --import tsx scripts/demo-data.ts cleanup --sqlite /absolute/path/demo.sqlite --plan /private/tmp/nijoow-retention.json --apply --confirm APPLY_RETENTION
```

PostgreSQL은 URL을 명령 인자로 출력하지 않도록 전용 환경변수에 넣은 뒤 `--sqlite ...` 대신 `--postgres`를 사용한다. `.env.local`의 앱 연결을 자동 사용하지 않는다.

계획은 24시간 이내만 허용한다. 실행할 때 각 공간을 별도 트랜잭션으로 다시 읽어 **회원 전환 없음, 접근 시각 동일, 7일 초과, 남은 공유 없음**을 확인한다. dry-run 이후 활동·계정 이관·공유 생성은 삭제보다 우선한다. 만료 공유도 계획의 만료 시각과 현재 값을 다시 비교한다. 삭제/보류 건수를 출력한다. 만료 공유 수가 배치보다 많아 남아 있으면 해당 공간은 보류하고 새 계획으로 후속 실행한다. 같은 계획을 재실행해도 새 데이터를 추가 삭제하지 않는다.

SQLite apply는 기존 파일이 존재해야 하며 앱 어댑터로 열린다. 스키마가 구버전이면 어댑터의 비파괴 스키마 보완이 먼저 수행될 수 있다. 새 배포 스키마를 준비한 후 정리 도구를 사용한다.

## SQLite 백업·복원

실행 중 WAL 파일만 단독 복사하지 않는다. 아래 백업은 원본을 읽기 전용으로 열고 `VACUUM INTO`로 **커밋된 WAL 내용을 포함한 일관된 새 파일**을 만든다. 원본을 건드리지 않으며 백업 경로가 이미 있으면 실패한다. `integrity_check`, `foreign_key_check`와 핵심 테이블 건수를 확인한다. 백업 파일은 0600 권한으로 보관한다.

```sh
node --import tsx scripts/demo-data.ts backup --sqlite /absolute/path/demo.sqlite --file /secure/backups/demo-2026-10-03.sqlite
node --import tsx scripts/demo-data.ts restore --sqlite /private/tmp/demo-restored.sqlite --file /secure/backups/demo-2026-10-03.sqlite --confirm RESTORE_NEW_DATABASE
```

복원은 **존재하지 않는 경로에만** 복사하고 무결성을 다시 검사한다. 기존 앱 DB를 덮어쓰거나 설정을 자동 전환하지 않는다. 복원본에서 로그인된 공간, 디자인 버전, 주문·공유 스냅샷을 확인한 뒤 서비스 정지/연결 전환을 별도 작업으로 계획한다.

## PostgreSQL 백업·복원

서버 버전 이상에 호환되는 `pg_dump`, `pg_restore`가 PATH에 필요하다. 전용 `NIJOOW_OPERATIONS_POSTGRES_URL`을 명시하고 아래를 실행한다. 도구는 URL을 프로세스 인자가 아닌 libpq 환경변수로 전달한다. `nijoow_demo` 스키마만 custom archive로 보관하고 소유자·ACL은 제외한다. 기존 dump와 메타데이터 파일을 덮어쓰지 않는다.

```sh
node --import tsx scripts/demo-data.ts backup --postgres --file /secure/backups/nijoow-2026-10-03.dump
# NIJOOW_OPERATIONS_POSTGRES_URL을 별도의 빈 검증 DB로 변경한다.
node --import tsx scripts/demo-data.ts restore --postgres --file /secure/backups/nijoow-2026-10-03.dump --confirm RESTORE_NEW_DATABASE
```

백업의 DB 식별 해시와 다른 대상이어야 하고 대상 DB에 `nijoow_demo`가 이미 있으면 중단한다. `pg_restore --single-transaction --exit-on-error --no-owner --no-acl`로 원자적으로 복원한다. 스키마를 DROP하거나 운영 DB를 덮어쓰는 옵션은 없다. 백업 후 `pg_restore --list` 성공은 archive 구조 확인만 의미하며 **실제 복원 검증과 다르다**.

직접 수행하는 같은 절차는 아래와 같다. 선택한 URL을 PGHOST/PGPORT/PGDATABASE/PGUSER로 분리하고, 비밀번호는 권한 0600의 임시 PGPASSFILE에 저장한다. URL을 PGDATABASE 자체에 넣지 않으며 비밀값을 명령 인자나 로그에 노출하지 않는다. 임시 비밀번호 파일은 종료 시 제거한다.

```sh
pg_dump --format=custom --schema=nijoow_demo --no-owner --no-acl --file=/secure/backups/nijoow.dump
pg_restore --list /secure/backups/nijoow.dump
# PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSFILE을 별도 빈 검증 DB로 지정하고 nijoow_demo 부재를 먼저 확인한다.
pg_restore --dbname='' --single-transaction --exit-on-error --no-owner --no-acl /secure/backups/nijoow.dump
```

단일 스키마 백업에는 PostgreSQL role·다른 스키마·서버 설정·인증 제공자 설정·이미지/모델 파일이 포함되지 않는다. 외부 스키마 참조를 새로 도입하면 백업 범위를 함께 확장해야 한다. 백업 파일과 `.json` 메타데이터를 함께 보관한다. 대상을 바꾸기 전에 실제 복원본에서 테이블 건수·외래키·저장 주문/공유의 modelVersion을 검사하고 격리 앱 흐름을 검증한다.

## 에셋 보존·실패 확인·검증 근거

DB는 모델 **버전 참조**를 저장하므로 백업 당시 Git revision과 `public/models/`, `public/editorial/`의 버전별 파일을 함께 보관한다. 새 모델을 기존 경로에 덮어쓰지 않는다. 정리 스크립트는 에셋 디렉터리를 열거나 삭제하지 않는다. DB 복원만으로 삭제된 모델을 복구할 수 없다.

API의 `[demo-api]`, PostgreSQL의 `[demo-db]`, 도구의 `[data-operation]` 로그를 배포 플랫폼 로그에서 최근 실패 시각·HTTP 상태와 함께 확인한다. API는 DB 상세 메시지·SQL·연결 문자열 대신 오류 종류/코드만 기록한다. 정리 출력의 보류 수는 오류가 아니라 재검사 결과다. 실패했다고 전체 스키마를 초기화하거나 운영 연결로 테스트하지 않는다.

`tests/data-operations.test.ts`는 설정 경계, 동시 게스트 저장·공유의 429, 창 만료 후 복구, 생성 용량 상한, 계정 이관·접근 뒤 정리 보류, 살아 있는 공유/회원 보호, 복원 파일 덮어쓰기 차단을 검증한다. SQLite 백업 검증은 열린 WAL 원본의 회원 디자인·주문·공유를 임시 파일로 실제 백업/복원하고 payload와 버전을 비교한다.

```sh
node --import tsx --test tests/commerce.test.ts tests/data-operations.test.ts
```

현재 로컬 SQLite 대상 검증은 통과했다. PostgreSQL의 독립 연결 경쟁 및 dump/restore는 별도의 폐기 가능한 검증 DB에서 실행해야 한다. 운영 자동 정리 활성화·기존 레코드 삭제·공개 배포는 이 로컬 구현 완료와 별개다.
