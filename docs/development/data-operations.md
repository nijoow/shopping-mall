# 데이터 정리·백업·복원

## 데이터베이스 선택

| 환경 | 연결 |
| --- | --- |
| 로컬 앱 | `NIJOOW_POSTGRES_URL`, 없으면 `NIJOOW_DEMO_DB_PATH` 또는 `.data/editorial.sqlite` |
| Vercel | `NIJOOW_POSTGRES_URL` 또는 `POSTGRES_URL` 필수 |
| HTTP 테스트 | `NIJOOW_TEST_SQLITE_ONLY=1`과 임시 SQLite 경로 |
| PostgreSQL 테스트 | `NIJOOW_TEST_POSTGRES_URL` |
| 운영 도구 | `--sqlite 파일` 또는 `--postgres`와 `NIJOOW_OPERATIONS_POSTGRES_URL` |

- 운영 도구는 `.env.local`의 연결을 자동 사용하지 않음.
- PostgreSQL의 앱 스키마는 `yarn db:setup`으로 준비. 기존 테이블과 `public` 스키마는 초기화하지 않음.
- 비밀값과 연결 문자열을 명령 인자·로그에 남기지 않음.

## 방문자 데이터

- 방문자 공간: 마지막 접근 후 7일 초과 시 접근 만료.
- 공유 링크: 생성 후 7일 유효. 생성 당시 디자인과 모델 버전 보관.
- 만료 데이터는 조회만 차단되며, 물리 삭제에는 아래 정리 명령 필요.
- 생성·저장·공유 제한은 DB의 `operation_limits`에 기록.

| 항목 | 제한 |
| --- | --- |
| 공간 생성 | 전체 10분당 120개, 최대 5,000개 |
| 디자인 저장 | 공간별 분당 30회, 공간별 50개, 전체 25,000개 |
| 공유 생성 | 공간별 분당 10회, 공간별 50개, 전체 25,000개 |

- 한도 초과: HTTP 429와 `Retry-After` 반환.
- IP별 제한은 아님. 새 공간을 반복 생성하는 요청 차단은 별도 필요.

## 만료 데이터 정리

먼저 삭제 대상 목록을 만들고 내용을 확인합니다.

```sh
node --import tsx scripts/demo-data.ts cleanup --sqlite /absolute/path/demo.sqlite --plan /private/tmp/nijoow-retention.json --batch 50
```

백업과 대상 DB를 확인한 뒤 같은 목록으로 실행합니다.

```sh
node --import tsx scripts/demo-data.ts cleanup --sqlite /absolute/path/demo.sqlite --plan /private/tmp/nijoow-retention.json --apply --confirm APPLY_RETENTION
```

- 목록 유효기간 24시간. 기존 목록 파일은 덮어쓰지 않음.
- 실행 직전 접근 시각·만료·계정 연결·살아 있는 공유를 다시 확인.
- 이전 계정 연결 공간, 살아 있는 공유가 있는 공간, 모델 파일은 삭제 대상에서 제외.
- 한 번에 공유·공간 각각 최대 100개 처리. 남은 대상은 새 목록으로 처리.
- PostgreSQL은 `--sqlite ...` 대신 `--postgres` 사용.

## SQLite 백업·복원

```sh
node --import tsx scripts/demo-data.ts backup --sqlite /absolute/path/demo.sqlite --file /secure/backups/demo.sqlite
node --import tsx scripts/demo-data.ts restore --sqlite /private/tmp/demo-restored.sqlite --file /secure/backups/demo.sqlite --confirm RESTORE_NEW_DATABASE
```

- 백업은 `VACUUM INTO`로 커밋된 WAL 내용까지 포함.
- 원본과 기존 백업 파일을 덮어쓰지 않음.
- 복원은 존재하지 않는 새 경로만 허용. 서비스 연결은 자동 변경되지 않음.
- 무결성·외래키 검사와 테이블 건수를 확인.

## PostgreSQL 백업·복원

서버 버전과 호환되는 `pg_dump`, `pg_restore`가 필요합니다.

```sh
# NIJOOW_OPERATIONS_POSTGRES_URL에 백업할 DB 지정
node --import tsx scripts/demo-data.ts backup --postgres --file /secure/backups/nijoow.dump
# 같은 변수를 별도의 빈 복원 DB로 변경
node --import tsx scripts/demo-data.ts restore --postgres --file /secure/backups/nijoow.dump --confirm RESTORE_NEW_DATABASE
```

- `nijoow_demo` 스키마만 보관. role·서버 설정·다른 스키마는 제외.
- 백업한 DB와 다른 연결이고 `nijoow_demo`가 없는 대상에만 복원.
- 복원은 단일 트랜잭션 사용. 기존 스키마를 DROP하지 않음.
- dump와 메타데이터 JSON을 함께 보관.

## 모델과 복원 확인

- DB에는 모델 파일이 아닌 버전 참조가 저장됨.
- 백업 시점의 Git 커밋과 `public/models/`, `public/editorial/`도 보관.
- 복원 DB에서 테이블 건수·외래키·주문·공유의 `modelVersion`을 확인한 뒤 앱 연결 변경.
- 테스트는 운영과 분리된 DB에서 실행.
