import Link from 'next/link';
export const metadata = { title: 'About this project' };
export default function Page() {
  return (
    <div className="page-shell about-page">
      <span className="eyebrow">A NEW PERSPECTIVE ON EVERYDAY</span>
      <h1 className="display">ABOUT THE EDIT.</h1>
      <p>
        NIJOOW는 스니커즈를 3D로 편집하고, 만든 디자인을 저장·공유·모의 주문하는
        포트폴리오 프로젝트입니다. 실제 상품 판매, 결제, 배송은 진행되지
        않습니다.
      </p>
      <h2>만드는 과정</h2>
      <p>
        러너는 Shopify의 공개 glTF 모델을 가공했으며, 로우탑은 직접
        제작했습니다. 재킷·니트·바지·가방·모자의 상품 이미지는 이미지 생성
        도구로 제작한 가상 제품 이미지입니다. 3D 모델의 조형과 표면은 검수·개선
        중입니다.
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
          폰트 원본과 함께 보관하고 있습니다.
        </li>
        <li>
          각 상품의 이름·가격·설명은 가상 컬렉션과 쇼핑 체험을 위해
          구성되었습니다.
        </li>
      </ul>
      <h2>체험 데이터</h2>
      <p>
        디자인·찜·장바구니·주문은 현재 이용 중인 게스트 체험 또는 로그인한
        계정에 보관됩니다. 소셜 로그인하면 게스트로 체험하던 데이터를 계정에
        이어서 보관할 수 있습니다.
      </p>
      <p>
        공유 링크는 생성 후 7일간 유효합니다. 게스트 체험은 7일 동안 접속하지
        않으면 기존 체험을 이어갈 수 없습니다. 이 기간은 데이터의 자동 삭제
        시점을 의미하지 않습니다.
      </p>
      <Link className="button" href="/studio/runner">
        디자인 만들기 ↗
      </Link>
    </div>
  );
}
