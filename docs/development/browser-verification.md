# 브라우저 회귀 검증

## 실행

Node 기준과 기본 명령은 하네스를 따른다. `@playwright/test`가 설치된 저장소에서 Chromium을 준비하고 **변경을 반영한 프로덕션 빌드**를 먼저 생성한다. 테스트가 빌드를 자동 생성하지 않는다.

```sh
node .yarn/releases/yarn-4.0.2.cjs exec playwright install chromium
node .yarn/releases/yarn-4.0.2.cjs build
node .yarn/releases/yarn-4.0.2.cjs exec playwright test
```

Linux CI에서 필요한 시스템 패키지까지 설치하려면 `playwright install --with-deps chromium`을 사용한다. `test:browser`는 `playwright test`를 호출한다. 빌드를 다른 작업과 동시에 실행하지 않는다. 테스트 목록/구문만 확인할 때는 서버·브라우저를 실행하지 않는 `playwright test --list`를 사용한다.

## 실행 격리

`playwright.config.ts`는 Chromium 한 종류, worker 1개, 재시도 0회로 실행한다. 정확히 세 개의 시나리오만 등록되어 있다. `tests/browser/global-setup.ts`가 OS 임시 폴더에 SQLite 파일을 만들고 사용 가능한 로컬 포트에서 **자신의** Next production 서버를 시작한다. `.next/BUILD_ID`가 없으면 실패한다. 기존 개발 서버 재사용이나 종료는 없다.

자식 서버에는 `NIJOOW_TEST_SQLITE_ONLY=1`, 명시적 임시 `NIJOOW_DEMO_DB_PATH`, 비어 있는 일반 PostgreSQL/Cloud 설정을 전달한다. `NIJOOW_APP_URL`에 테스트 서버의 로컬 origin을 주입한다. OAuth 설정은 사용하지 않는다. `.env.local`의 운영 DB가 있더라도 테스트 격리 선택이 우선한다. 운영 DB·외부 결제에 접근하지 않는다.

각 테스트는 새 브라우저 context로 시작하므로 쿠키와 초안 localStorage가 다른 시나리오에 이어지지 않는다. 화면과 보조 탭의 HTTP 요청은 해당 임시 서버 origin만 허용한다. API 상태 확인도 같은 페이지의 브라우저 fetch로 로컬 `/api/demo`를 사용하며 실제 주문/저장 상태를 검증한다. 생성한 서버가 종료된 후 자신의 임시 DB 폴더만 삭제한다. 강제 종료로 남은 `nijoow-browser-*` 폴더는 해당 실행의 프로세스 종료를 확인한 후에만 정리한다.

## 세 시나리오와 근거

| 시나리오           | 검증                                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 일반 의류 주문     | FIELD JACKET에서 사이즈 누락 시 초점 이동, 키보드 Enter로 M 선택, 실제 장바구니 → 모바일 모의 결제 → 주문 조회/새로고침; 상품/수량/사이즈와 구매 행 제거, 내 공간 재방문·로그인 UI 부재·동일 쿠키 주문 유지 확인 |
| low v3 커스텀 주문 | 실제 low-v3.glb 200 응답, 로드 완료 viewer/canvas, 색상·재질·각인 수정, preview 저장, PNG 시그니처·크기·바이트 확인, 내 디자인에서 재열기, 공유 페이지 모델/각인 확인, 주문 스냅샷 일치와 주문 당시 3D dialog    |
| 저장 실패 복구     | 저장 요청만 네트워크 실패 주입 → 이름 유지/서버 미저장 → 재시도 저장; 로컬 API로 다른 창의 개정본을 실제 저장 → CONFLICT → 편집 유지/사본 저장 → 원본 보존/사본 새로고침                                         |

데이터를 직접 심어 화면을 건너뛰지 않는다. 실패 복구 시나리오의 병행 수정만 같은 테스트 공간의 로컬 API를 사용한다. 네트워크 실패는 외부 서비스 장애가 아니라 Playwright route abort로 주입한다. 오류 코드 속성으로 문제 상태를 식별하고 사이트 문장 전체 스냅샷에 의존하지 않는다.

1440에서 상품 탐색, 390×844에서 checkout/주문, 1280에서 스튜디오/복구를 검증한다. 각 시나리오 전체를 뷰포트마다 복제하지 않는다. 가로 overflow와 모바일 결제 버튼이 화면 안에 들어오는지 확인한다. 디자인 삭제 dialog는 키보드 진입, 취소 기본 초점, Tab 순환, Escape 닫기, 원래 버튼으로 초점 복귀와 미삭제를 검증한다. 주문 3D dialog도 Escape 닫기를 확인한다.

기존 `studio`, `design-name`, `studio-retry`, `studio-save-copy`, `checkout-submit` test ID와 실제 접근성 이름을 사용한다. `product-viewer`의 `data-loaded`, `data-model`, `data-model-version`은 fallback 사진을 3D 성공으로 처리하지 않기 위한 상태 계약이다.

## 결과와 한계

HTML 보고서는 `artifacts/browser/report`, trace/실패 시 화면/검증한 PNG는 `artifacts/browser/test-results`에 남긴다. 정상 화면의 기준 스냅샷이나 동영상은 만들지 않는다. `pageerror` 및 외부 요청은 실패로 처리한다. CLI 목록 검사는 테스트 탐색과 구문 확인만 의미하며 브라우저 흐름 통과가 아니다.

Chromium은 CI의 headless 실행에서 SwiftShader WebGL을 사용한다. PNG가 유효하고 모델이 실제 로드되었는지는 확인하지만 이것이 제품의 육안 품질, 모바일 기기 GPU 성능, 실제 Safari, 모든 키보드/보조 기술 검수의 완료를 의미하지 않는다. 대표/측면/후면/밑창 및 재질 품질은 별도의 실제 시각 검수로 확인한다. 운영 PostgreSQL/공개 배포도 이 검증 범위 밖이다.

실제 검증에서 APIRequestContext가 HTTP loopback의 Secure 쿠키를 브라우저와 다르게 처리해 별도 게스트를 만드는 문제가 확인되어, 상태 확인과 경쟁 수정은 브라우저 fetch로 통일했다. 운영 쿠키 정책을 테스트 편의를 위해 완화하지 않았다.
