# NIJOOW — Editorial 3D Store

스니커즈의 색상·재질·각인을 3D로 편집하고, 저장·공유·모의 주문까지 체험하는 패션 편집숍 포트폴리오입니다. 의류·잡화는 이미지 기반 상품으로 함께 구성했습니다. 실제 결제와 배송은 발생하지 않습니다.

[데모 사이트](https://nijoow-shopping-mall.vercel.app) · [개발 문서](docs/README.md)

## 주요 기능

- 매거진형 홈, 상품 탐색·검색·정렬·찜
- 러너·로우탑 3D 편집, 실행 취소·다시 실행, 디자인 저장·복제
- 공유 링크, PNG 이미지 내보내기
- 일반·커스텀 상품 장바구니와 모의 결제
- 주문 당시 디자인 조회, 배송 단계·취소·반품·모의 환불 체험

로그인 없이 방문자별 **내 공간**을 사용합니다. 저장 내역은 같은 브라우저의 쿠키로 접근하며, 쿠키 삭제·다른 브라우저/기기 이용·7일 미접속 시 기존 목록에 접근할 수 없습니다. 공유 링크는 생성 후 7일간 유효한 읽기 전용 디자인을 표시합니다.

## 기술 스택

Next.js 16 · React 19 · TypeScript · React Three Fiber / Three.js · SQLite / PostgreSQL · Playwright

## 로컬 실행

Node.js **22.13 이상**이 필요하며, 권장 버전은 [`.nvmrc`](.nvmrc)를 따릅니다. Yarn 4.0.2는 저장소에 포함되어 있습니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
node .yarn/releases/yarn-4.0.2.cjs dev
```

기본 주소는 [http://127.0.0.1:3000](http://127.0.0.1:3000)입니다. PostgreSQL 연결 설정이 없으면 로컬 SQLite(`.data/editorial.sqlite`)를 사용합니다. 환경 변수와 Cloud 실행은 [환경 설정](docs/development/environment.md)을 참고합니다.

## 검증

```sh
# 타입·린트·단위 테스트·에셋 계약
node .yarn/releases/yarn-4.0.2.cjs check
# 브라우저 설치 후 빌드·HTTP·브라우저 흐름까지 검증
node .yarn/releases/yarn-4.0.2.cjs exec playwright install chromium
node .yarn/releases/yarn-4.0.2.cjs check:full
```

PostgreSQL 통합 테스트와 변경별 검증 절차는 [하네스](docs/development/harness.md)에 정리되어 있습니다.

## 에셋

러너는 Shopify의 Materials Variants Shoe 모델을 가공했으며, 로우탑은 Blender로 직접 제작했습니다. 의류·잡화 이미지는 생성형 이미지 도구로 제작한 가상 제품 이미지입니다. 러너 원본의 라이선스는 **CC BY 4.0**입니다.

- [러너 모델 출처](public/models/source/shopify-source.md)
- [상품 이미지 제작 기록](docs/planning/product-image-prompts-2026-09-21.md)

## 개발 문서

- [문서 안내](docs/README.md)
- [작업 규칙](AGENTS.md)
- [데이터 정리·백업·복원](docs/development/data-operations.md)
- [시연 가이드](docs/portfolio/demo-guide.md)
