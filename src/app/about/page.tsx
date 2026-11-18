import Link from 'next/link';
export const metadata = { title: 'About this project' };
export default function Page() {
  return (
    <div className="page-shell about-page">
      <span className="eyebrow">A NEW PERSPECTIVE ON EVERYDAY</span>
      <h1 className="display">ABOUT THE EDIT.</h1>
      <p>
        NIJOOW는 스니커즈 중심의 가상 편집숍입니다. 상품을 둘러보고, 스니커즈의
        색상·재질·각인을 3D로 편집해 나만의 조합을 만들 수 있습니다. 만든
        디자인은 저장하거나 공유하고, 주문 과정까지 이어서 체험해 보세요.
      </p>
      <Link className="button" href="/studio/low">
        디자인 만들기 ↗
      </Link>
      <h2>하나의 디자인으로 이어지는 쇼핑</h2>
      <ul>
        <li>
          러너와 로우탑을 여러 시점으로 확인하고, 부위별 색상과 표면 재질을
          선택할 수 있습니다. 각인을 더하거나 이전 편집으로 돌아갈 수도
          있습니다.
        </li>
        <li>
          내 디자인을 저장·복제하고, 공유 링크나 PNG 이미지로 남길 수 있습니다.
          공유받은 디자인은 사본을 만들어 편집할 수 있습니다.
        </li>
        <li>
          스니커즈와 의류·잡화를 장바구니에 함께 담고, 모의 결제부터 배송
          단계·취소·반품까지 체험할 수 있습니다. 디자인을 수정해도 기존 주문의
          구성은 유지됩니다.
        </li>
      </ul>
      <p>
        이 사이트는 디자인과 개발을 함께 보여주는 포트폴리오 프로젝트입니다.
        모든 상품과 가격은 체험용이며, 실제 판매·결제·배송·환불은 진행되지
        않습니다. 사이즈와 재질 선택은 실제 착용감이나 제품 사양을 보증하지
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
        방문자별로 디자인·찜·장바구니·주문을 보관하며, 같은 브라우저의 내
        공간에서 이어서 확인할 수 있습니다. 내 공간은 브라우저에 저장된 쿠키로
        구분합니다. 쿠키를 삭제하거나 다른 브라우저·기기를 이용하면 기존 체험에
        접근할 수 없습니다.
      </p>
      <p>
        7일 동안 접속하지 않으면 기존 체험을 이어갈 수 없습니다. 이 기간은
        데이터의 자동 삭제 시점을 의미하지 않습니다.
      </p>
      <p>
        공유 링크는 생성 후 7일간 유효하며, 공유 시점의 디자인을 읽기 전용으로
        표시합니다. 다른 브라우저에서도 링크로 디자인을 볼 수 있지만, 원래
        방문자의 내 공간에는 접근할 수 없습니다. 공유받은 디자인은 사본으로
        저장해 편집할 수 있습니다.
      </p>
      <Link className="button outline" href="/shop/all">
        컬렉션 둘러보기 ↗
      </Link>
    </div>
  );
}
