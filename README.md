# NIJOOW Editorial 3D Store

스니커즈를 3D로 커스터마이징하고 저장, 공유, 모의 주문까지 경험할 수 있는 패션 편집숍 포트폴리오입니다. 의류와 잡화는 이미지 기반 상품으로 구성했으며, 실제 결제나 배송은 이루어지지 않습니다.

[데모 사이트](https://nijoow-shopping-mall.vercel.app) | [개발 문서](docs/README.md)

## 주요 기능

- 매거진형 홈, 상품 탐색, 검색, 정렬, 찜
- 러너 및 로우탑 색상, 재질, 각인 편집
- 실행 취소, 다시 실행, 디자인 저장 및 복제
- 디자인 공유 링크 생성 및 PNG 내보내기
- 일반 및 커스텀 상품 장바구니와 모의 결제
- 주문 당시 디자인 조회 및 배송 단계, 취소, 반품, 모의 환불 체험

## 저장과 공유

로그인 없이 방문자별 **내 공간**을 사용하며, 같은 브라우저의 쿠키로 저장 내역에 접근합니다. 쿠키를 삭제하거나 다른 기기나 브라우저를 이용하는 경우, 또는 7일 이상 미접속 시 기존 목록에는 접근할 수 없습니다. 공유 링크는 생성 후 7일간 유효하며 읽기 전용으로 열립니다.

## 기술 스택

Next.js 16, React 19, TypeScript, React Three Fiber, Three.js, SQLite, PostgreSQL, Playwright

## 실행

Node.js 22.13 이상([`.nvmrc`](.nvmrc) 참고)과 저장소에 포함된 Yarn 4.0.2를 사용합니다.

```sh
node .yarn/releases/yarn-4.0.2.cjs install --immutable
node .yarn/releases/yarn-4.0.2.cjs dev
```

개발 서버 주소는 `http://127.0.0.1:3000`이며, PostgreSQL 설정이 없으면 로컬 SQLite(`.data/editorial.sqlite`)를 사용합니다. 자세한 설정은 [환경 변수 및 클라우드 실행 설정](docs/development/environment.md)을 참고하세요.

## 에셋

- 러너: Shopify Materials Variants Shoe 가공 (CC BY 4.0, [모델 출처](public/models/source/shopify-source.md))
- 로우탑: Blender로 직접 제작
- 의류 및 잡화: 생성형 이미지 도구로 제작한 가상 제품

## 문서

- [데이터 정리와 백업 및 복원](docs/development/data-operations.md)
