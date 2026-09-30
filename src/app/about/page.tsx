import Link from 'next/link';
export const metadata = { title: 'About this project' };
export default function Page() {
  return (
    <div className="page-shell about-page">
      <span className="eyebrow">A NEW PERSPECTIVE ON EVERYDAY</span>
      <h1 className="display">ABOUT THE EDIT.</h1>
      <p>
        NIJOOW는 스니커즈를 3D로 편집하고, 만든 디자인을 저장·공유·모의 주문하는
        포트폴리오 프로젝트야. 실제 상품 판매, 금액 청구, 배송은 발생하지 않아.
      </p>
      <h2>만드는 과정</h2>
      <p>
        러너는 Shopify의 공개 glTF 샘플을 바탕으로 부위 편집을 위한 자산을
        가공하고 있어. 로우탑은 직접 제작한 모델이고, 재킷·니트·가방의 2D 상품
        이미지는 이미지 생성으로 직접 제작한 가상 제품 이미지야. 모델의 조형과
        표면은 현재 검수·개선 단계야.
      </p>
      <h2>에셋 출처</h2>
      <ul>
        <li>
          Runner: Materials Variants Shoe © 2021 Shopify,{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
          부위 분리·색상/재질 편집 및 표시 크기 수정.{' '}
          <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe">
            원본
          </a>
        </li>
        <li>
          Anton: Google Fonts / SIL Open Font License. 라이선스는 프로젝트의
          폰트 원본과 함께 보관돼.
        </li>
        <li>
          각 상품의 이름·가격·설명은 가상 컬렉션과 기능 체험을 위한 데이터야.
        </li>
      </ul>
      <h2>체험 데이터</h2>
      <p>
        방문자별 공간에서 디자인·찜·장바구니·주문을 분리해 보관해. 소셜 로그인
        시 같은 계정으로 작업을 이어갈 수 있어. 현재 개발 버전은 원격 운영 DB와
        분리된 로컬 SQLite 저장소를 사용해.
      </p>
      <Link className="button" href="/studio/runner">
        나의 디자인 시작하기 ↗
      </Link>
    </div>
  );
}
