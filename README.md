# 👟 NIJOOW

3D 스니커즈 커스터마이징을 넣은 쇼핑몰 토이프로젝트.
상품을 둘러보고, 직접 바꾼 디자인을 저장하거나 장바구니에 담아 주문까지 진행할 수 있습니다.
결제와 배송은 데모로 동작합니다.

## 기술 스택

Next.js 16 · TypeScript · React Three Fiber / Three.js · Auth.js · SQLite / PostgreSQL

## 주요 기능

- 상품 목록, 검색·정렬, 찜
- 스니커즈 부위별 색상, 재질, 각인 편집
- 디자인 저장·복제·공유, 이미지 내보내기
- 장바구니, 주문, 배송 상태 변경, 취소·반품
- 구글·카카오·네이버 소셜 로그인

## 로컬 실행

Node.js 22.13 이상, Yarn 4.0.2를 사용합니다.

```sh
corepack enable
yarn install --immutable
yarn dev --port 3100
```

[http://127.0.0.1:3100](http://127.0.0.1:3100)에서 실행됩니다.
Corepack이 없는 환경에서는 `yarn` 대신 `node .yarn/releases/yarn-4.0.2.cjs`를 사용할 수 있습니다.

소셜 로그인 없이 게스트로 체험할 수 있습니다. 로컬 데이터는 `.data/editorial.sqlite`에 저장됩니다.

## 환경 변수와 배포

[.env.example](.env.example)을 참고해 `.env.local`을 설정합니다.

| 변수 | 용도 |
| --- | --- |
| `AUTH_SECRET` | 세션 서명 키 |
| `AUTH_URL` | 서비스 주소 |
| `AUTH_TRUST_HOST` | 신뢰할 수 있는 프록시 환경에서 `true` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | 구글 로그인 |
| `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET` | 카카오 로그인 |
| `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET` | 네이버 로그인 |
| `NIJOOW_POSTGRES_URL` | PostgreSQL 연결 주소 |
| `POSTGRES_URL` | Vercel에서 사용하는 PostgreSQL 연결 주소 |
| `NIJOOW_DEMO_DB_PATH` | 로컬 SQLite 파일 경로 변경 |

소셜 로그인 제공자에 `{서비스 주소}/api/auth/callback/{google|kakao|naver}`를 각각 등록해야 합니다.

Vercel 배포에는 PostgreSQL이 필요합니다. 연결 주소를 설정한 뒤 최초 한 번 실행합니다.

```sh
yarn db:setup
```

데모 테이블은 `nijoow_demo` 스키마를 사용합니다. 기존 `public` 테이블은 변경하지 않으며, 로컬 SQLite 데이터는 자동으로 이전되지 않습니다.

## 개발 명령어

```sh
yarn test
yarn typecheck
yarn lint
yarn build
yarn test:http  # 로컬 서버 실행 후 HTTP 테스트
```

`main`과 `develop`에 push하거나 PR을 올리면 CI가 실행됩니다.
`main`에 반영된 `package.json` 버전으로 릴리스를 생성하며, 같은 버전의 릴리스가 있으면 건너뜁니다.

## 에셋

러너 모델은 [Shopify Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe)를 수정해 사용했습니다. 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이며, 수정 사항은 [출처 문서](public/models/source/shopify-source.md)에 있습니다.
로우탑 모델은 Blender로 제작했고, 일부 상품 이미지는 생성형 이미지 도구로 만든 가상 제품 이미지입니다.

## 추가할 기능

- 스니커즈 모델 디테일 개선, 부품 형태 교체
- 실제 모바일 기기에서 성능 확인
- 운영용 상품·주문 관리 화면

소셜 로그인은 제공자 설정 후 배포 주소에서 확인이 필요합니다.
