# NIJOOW 작업 안내

## 문서와 제품 문구

- 저장소 문서는 존댓말 또는 중립적인 문서체로 작성한다. 대화 말투 지시는 프로젝트 파일에 추가하지 않는다.
- **사이트 문구는 쇼핑몰에 맞는 존댓말·중립 표현을 사용한다.** 기준: `docs/planning/ui-copy.md`.
- 실제 결제·배송이 없는 포트폴리오다. 모의 결제 안내를 유지하고 실제 판매·재고·배송 약속을 만들지 않는다.
- 이름은 NIJOOW이며 스니커즈 중심 편집숍, 매거진형 디자인, 데스크톱 우선을 유지한다. 문의·후기·별도 관리자·실결제는 후순위다.
- 로그인·소셜 계정 연동은 제공하지 않는다. `/my-page`는 내 공간이며, 쿠키를 유지한 같은 브라우저에서 디자인·찜·장바구니·모의 주문을 이어간다. 공유·PNG를 유지한다.

## 작업 시작

1. `git status --short`와 현재 브랜치를 확인한다. 사용자 변경과 로컬 설정을 보존한다.
2. `README.md`에서 명령, `BACKLOG.md`에서 다음 작업을 확인한다. 실제 구현 판단은 코드·실행 결과를 우선한다.
3. 관련 파일과 호출 흐름만 좁혀 읽는다. 기본 검색 범위는 `src scripts tests`다. `archive/`, `docs/archive/`, 빌드·QA 출력은 현재 구현으로 취급하지 않는다.
4. 변경 종류에 맞는 검증을 `docs/development/harness.md`에서 선택한다. Node 22.13 이상, 기준 버전은 `.nvmrc`, Yarn은 저장소의 4.0.2를 사용한다.

## 코드의 책임

| 경로                                  | 책임                                    |
| ------------------------------------- | --------------------------------------- |
| `src/domain/`                         | 상품·모델 버전·가격·입력 검증·주문 타입 |
| `src/server/repository.ts`            | 방문자 소유권·디자인·주문·재고          |
| `src/server/database.ts`              | SQLite / PostgreSQL 어댑터와 트랜잭션   |
| `src/app/api/demo/route.ts`           | HTTP 검증·세션 쿠키·오류 응답           |
| `src/components/commerce/`            | 쇼핑·편집·주문 화면과 상태              |
| `src/components/three/`               | 모델 로딩·재질·각인·촬영                |
| `public/editorial/`, `public/models/` | 제품 이미지와 버전별 모델               |

## 변경 원칙

- 기존 코드 → 표준 라이브러리 → 플랫폼 기능 → 설치된 의존성 순으로 재사용한다. 단순한 작업에 새 프레임워크를 추가하지 않는다.
- 디자인·찜·장바구니·주문의 쿠키별 소유권, 기존 자료 호환, 주문 중복 방지, 재고 원자성을 보존한다.
- 기존 모델 파일 버전을 덮어쓰지 않는다. 새 모델은 별도 버전으로 추가하고 카탈로그·검증·대표 이미지·저장 주문 호환성을 함께 확인한다.
- 에셋 구조 검사나 빌드 성공을 시각 품질 검수로 대신하지 않는다. 3D는 대표/측면/후면/밑창과 커스텀 상태를 실제 화면으로 확인한다.
- `.env.local`, `.data`, `.claude`, 사용자 제공 이미지, 다른 작업의 파일을 임의로 초기화하거나 커밋하지 않는다. 비밀값을 출력하지 않는다.
- 기본 테스트는 운영 DB에 연결하지 않는다. PostgreSQL 통합 검증은 별도의 `NIJOOW_TEST_POSTGRES_URL`만 사용한다.
- 원격 DB 초기화·공개 배포·푸시는 현재 요청의 범위를 확인한다. 이미 승인된 동일 작업은 반복해서 묻지 않는다.
- 하위 에이전트는 사용 권한이 있을 때만 사용한다. 작업 지시·조정·내부 요약은 간결한 영어로 작성한다. 사용자 설명과 내부 조정을 구분한다.

## 검증과 마무리

- 코드 변경: `node .yarn/releases/yarn-4.0.2.cjs check`.
- API·저장소·빌드 변경: `check:full`. 저장소 변경은 별도 테스트 DB의 `test:postgres`도 실행한다.
- UI·3D 변경: 위 검사에 해당 화면의 키보드·반응형·로딩/오류·시각 검수를 추가한다.
- 문서만 변경한 경우 링크·경로·명령·사실관계를 확인하고 불필요한 전체 빌드를 반복하지 않는다.
- 임시 서버는 직접 만든 프로세스만 종료한다. 사용 중인 개발 서버나 기존 DB를 검증을 위해 삭제하지 않는다.
- 완료 보고에 변경 내용, 실행한 검증, 생략한 검증/남은 한계를 구분한다. 로컬 완료·PR·운영 배포를 같은 뜻으로 사용하지 않는다.
- 확정 요구사항은 기획 문서, 현재 우선순위는 `docs/planning/next-steps.md`, 검증 절차는 하네스 문서에 기록한다. 같은 상태를 여러 문서에 복제하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
