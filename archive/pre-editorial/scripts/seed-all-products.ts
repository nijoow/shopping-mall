import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 로드
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (!match) return;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] ??= value;
    });
}

interface ProductSeed {
  productName: string;
  category: 'OUTER' | 'TOP' | 'BOTTOM' | 'SHOES' | 'ACCESSORY';
  imageUrl: string;
  price: number;
  description: string;
  colors: string[];
  color: string;
}

const PRODUCTS_DATA: ProductSeed[] = [
  // 1. SHOES (4종)
  {
    productName: 'NIJOOW Volt Runner',
    category: 'SHOES',
    price: 219000,
    imageUrl: '/images/products/volt-runner.png',
    description: '한밤의 트랙을 밝히는 볼트 옐로우. NIJOOW 오리지널 러너의 시작.',
    colors: ['#26262c', '#d7ff00', '#f4f2ec'],
    color: '#d7ff00',
  },
  {
    productName: 'NIJOOW Seoul Night',
    category: 'SHOES',
    price: 239000,
    imageUrl: '/images/products/seoul-night.png',
    description: '네온 핑크와 시안이 흐르는 새벽의 을지로 무드.',
    colors: ['#1b1b26', '#ff2e88', '#22d3ee'],
    color: '#ff2e88',
  },
  {
    productName: 'NIJOOW OG Paper',
    category: 'SHOES',
    price: 199000,
    imageUrl: '/images/products/og-paper.png',
    description: '빈티지 페이퍼 톤과 검 솔. 클래식은 영원하다.',
    colors: ['#f0ede3', '#1c1c1f', '#c8a06a'],
    color: '#f0ede3',
  },
  {
    productName: 'NIJOOW Concrete',
    category: 'SHOES',
    price: 189000,
    imageUrl: '/images/products/concrete.png',
    description: '도시의 콘크리트 그레이 톤온톤 무드.',
    colors: ['#6b7280', '#1f2937', '#d1d5db'],
    color: '#6b7280',
  },

  // 2. OUTER (4종)
  {
    productName: 'NIJOOW Tech Parka',
    category: 'OUTER',
    price: 329000,
    imageUrl: '/images/products/tech-parka.png',
    description: '매트 블랙 방수 지퍼 디테일의 하이엔드 테크웨어 쉘 파카.',
    colors: ['#000000', '#222222'],
    color: '#000000',
  },
  {
    productName: 'NIJOOW Sage MA-1',
    category: 'OUTER',
    price: 289000,
    imageUrl: '/images/products/sage-ma1.png',
    description: '빈티지 세이지 그린 컬러의 볼륨감 있는 루즈핏 MA-1 항공 점퍼.',
    colors: ['#4b5320', '#ff5500'],
    color: '#4b5320',
  },
  {
    productName: 'NIJOOW Denim Jacket',
    category: 'OUTER',
    price: 199000,
    imageUrl: '/images/products/denim-jacket.png',
    description: '오버사이즈드 헤비 스톤워시드 블루 데님 자켓.',
    colors: ['#4682b4', '#1c3b57'],
    color: '#4682b4',
  },
  {
    productName: 'NIJOOW Wool Blouson',
    category: 'OUTER',
    price: 249000,
    imageUrl: '/images/products/wool-blouson.png',
    description: '차콜 그레이 크롭 기장의 미니멀 지퍼 울 블루종.',
    colors: ['#36454f', '#222222'],
    color: '#36454f',
  },

  // 3. TOP (4종)
  {
    productName: 'NIJOOW Logo Sweatshirt',
    category: 'TOP',
    price: 129000,
    imageUrl: '/images/products/logo-sweatshirt.png',
    description: '바디 앞면에 심플한 엠보 로고가 새겨진 프리미엄 멜랑주 그레이 맨투맨.',
    colors: ['#808080', '#cccccc'],
    color: '#808080',
  },
  {
    productName: 'NIJOOW Cream Hoodie',
    category: 'TOP',
    price: 149000,
    imageUrl: '/images/products/cream-hoodie.png',
    description: '고중량 헤비웨이트 크림 베이지 오버핏 드롭숄더 후드티.',
    colors: ['#fffdd0', '#f5f5dc'],
    color: '#fffdd0',
  },
  {
    productName: 'NIJOOW Black Longsleeve',
    category: 'TOP',
    price: 89000,
    imageUrl: '/images/products/black-longsleeve.png',
    description: '소매단 핑거홀 디테일이 있는 매트 블랙 스트릿 롱슬리브 티셔츠.',
    colors: ['#000000', '#111111'],
    color: '#000000',
  },
  {
    productName: 'NIJOOW Olive Polo',
    category: 'TOP',
    price: 99000,
    imageUrl: '/images/products/olive-polo.png',
    description: '자연스러운 올리브 그린 컬러의 오버사이즈 피케 코튼 카라티.',
    colors: ['#556b2f', '#6b8e23'],
    color: '#556b2f',
  },

  // 4. BOTTOM (4종)
  {
    productName: 'NIJOOW Khaki Cargo',
    category: 'BOTTOM',
    price: 159000,
    imageUrl: '/images/products/khaki-cargo.png',
    description: '입체적인 포켓과 밑단 스트링 디테일의 와이드 카키 카고 팬츠.',
    colors: ['#bdb76b', '#556b2f'],
    color: '#bdb76b',
  },
  {
    productName: 'NIJOOW Baggy Jeans',
    category: 'BOTTOM',
    price: 139000,
    imageUrl: '/images/products/baggy-jeans.png',
    description: '자연스러운 워싱과 릴랙스드 실루엣의 연청 배기 데님 팬츠.',
    colors: ['#add8e6', '#87ceeb'],
    color: '#add8e6',
  },
  {
    productName: 'NIJOOW Nylon Trackpants',
    category: 'BOTTOM',
    price: 129000,
    imageUrl: '/images/products/nylon-trackpants.png',
    description: '옆선 리플렉티브 파이핑이 가미된 차콜 나일론 테크 트랙 팬츠.',
    colors: ['#36454f', '#000000'],
    color: '#36454f',
  },
  {
    productName: 'NIJOOW Gray Jogger',
    category: 'BOTTOM',
    price: 119000,
    imageUrl: '/images/products/gray-jogger.png',
    description: '탄탄한 코튼 소재의 편안한 멜랑주 그레이 조거 스웨트팬츠.',
    colors: ['#808080', '#e0e0e0'],
    color: '#808080',
  },

  // 5. ACCESSORY (4종)
  {
    productName: 'NIJOOW Cobalt Beanie',
    category: 'ACCESSORY',
    price: 49000,
    imageUrl: '/images/products/cobalt-beanie.png',
    description: '일렉트릭 코발트 블루 컬러의 골지 로고 라벨 비니.',
    colors: ['#0047ab', '#000000'],
    color: '#0047ab',
  },
  {
    productName: 'NIJOOW Black Beanie',
    category: 'ACCESSORY',
    price: 49000,
    imageUrl: '/images/products/black-beanie.png',
    description: '매트 블랙 컬러의 미니멀 데일리 비니.',
    colors: ['#000000', '#ffffff'],
    color: '#000000',
  },
  {
    productName: 'NIJOOW Orange Beanie',
    category: 'ACCESSORY',
    price: 49000,
    imageUrl: '/images/products/orange-beanie.png',
    description: '포인트 룩을 완성해 줄 선명한 네온 오렌지 골지 비니.',
    colors: ['#ff5f1f', '#000000'],
    color: '#ff5f1f',
  },
  {
    productName: 'NIJOOW Green Beanie',
    category: 'ACCESSORY',
    price: 49000,
    imageUrl: '/images/products/green-beanie.png',
    description: '스트릿 무드를 더해 주는 딥 포레스트 그린 골지 비니.',
    colors: ['#008000', '#ffffff'],
    color: '#008000',
  },
];

// 카테고리별 사이즈 옵션 (상품 상세 사이즈 선택·체크아웃과 연동)
const SIZES_BY_CATEGORY: Record<ProductSeed['category'], string[]> = {
  SHOES: ['250', '260', '270', '280', '290'],
  OUTER: ['S', 'M', 'L', 'XL'],
  TOP: ['S', 'M', 'L', 'XL'],
  BOTTOM: ['S', 'M', 'L', 'XL'],
  ACCESSORY: ['FREE'],
};

const seedAll = async () => {
  try {
    // 주문이 있으면 products 삭제가 FK로 막히거나 주문 이력이 깨진다 — 가드
    const orderCount = Number(
      (await sql.query('SELECT COUNT(*)::int AS c FROM order_items')).rows[0].c,
    );
    if (orderCount > 0) {
      console.error(
        `order_items에 ${orderCount}건이 있어 products 재시드를 중단합니다. 주문 데이터를 먼저 정리하세요.`,
      );
      return;
    }

    console.log('Clearing existing product data from database...');
    await sql.query('DELETE FROM products');
    console.log('Cleared all products successfully.');

    console.log('Inserting new high-quality products...');
    // 배열 앞쪽이 최신(NEW DROPS 상단)이 되도록 createdDate를 역순으로 스태거
    for (let i = 0; i < PRODUCTS_DATA.length; i += 1) {
      const item = PRODUCTS_DATA[i];
      // eslint-disable-next-line no-await-in-loop
      await sql.query(
        `INSERT INTO products
            ("productName", category, "imageUrl", price, description, stock, sell, colors, sizes, color, "createdDate", "modifiedDate")
         VALUES ($1::text, $2::text, $3::text, $4::int, $5::text, 20, 0, $6::text[], $7::text[], $8::text, NOW() - ($9 * INTERVAL '1 second'), NOW())`,
        [
          item.productName,
          item.category,
          item.imageUrl,
          item.price,
          item.description,
          item.colors,
          SIZES_BY_CATEGORY[item.category],
          item.color,
          i,
        ],
      );
      console.log(`Inserted product: ${item.productName}`);
    }
    console.log('All products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

seedAll();
