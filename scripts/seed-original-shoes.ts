/**
 * NIJOOW ORIGINALS 스니커즈 4종 시드
 * 3D 커스텀 랩의 시그니처 컬러웨이를 SHOES 카테고리 상품으로 등록한다.
 * (colors 배열은 상품 상세 3D 뷰어의 파트 매핑과 맞춰져 있다:
 *  [0] 메인/어퍼, [1] 사이드/힐, [2] 레이스/아웃솔)
 *
 *   yarn dlx tsx scripts/seed-original-shoes.ts
 */
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 로드 (dotenv 의존성 없이 동작)
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
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

const ORIGINALS = [
  {
    productName: 'NIJOOW Volt Runner',
    price: 219000,
    imageUrl: '/images/products/volt-runner.svg',
    description:
      '한밤의 트랙을 밝히는 볼트 옐로우. NIJOOW 오리지널 러너의 시작.',
    colors: ['#26262c', '#d7ff00', '#f4f2ec'],
    color: '#d7ff00',
  },
  {
    productName: 'NIJOOW Seoul Night',
    price: 239000,
    imageUrl: '/images/products/seoul-night.svg',
    description: '네온 핑크와 시안이 흐르는 새벽의 을지로 무드.',
    colors: ['#1b1b26', '#ff2e88', '#22d3ee'],
    color: '#ff2e88',
  },
  {
    productName: 'NIJOOW OG Paper',
    price: 199000,
    imageUrl: '/images/products/og-paper.svg',
    description: '빈티지 페이퍼 톤과 검 솔. 클래식은 영원하다.',
    colors: ['#f0ede3', '#1c1c1f', '#c8a06a'],
    color: '#f0ede3',
  },
  {
    productName: 'NIJOOW Concrete',
    price: 189000,
    imageUrl: '/images/products/concrete.svg',
    description: '도시의 콘크리트 그레이 톤온톤 무드.',
    colors: ['#6b7280', '#1f2937', '#d1d5db'],
    color: '#6b7280',
  },
];

async function seed() {
  for (const item of ORIGINALS) {
    // eslint-disable-next-line no-await-in-loop
    const result = await sql.query(
      `INSERT INTO products
          ("productName", category, "imageUrl", price, description, stock, sell, colors, color, "createdDate", "modifiedDate")
       SELECT $1::text, 'SHOES', $2::text, $3::int, $4::text, 20, 0, $5::text[], $6::text, NOW(), NOW()
       WHERE NOT EXISTS (SELECT 1 FROM products WHERE "productName" = $1::text)`,
      [
        item.productName,
        item.imageUrl,
        item.price,
        item.description,
        item.colors,
        item.color,
      ],
    );
    console.log(
      `${item.productName}: ${result.rowCount === 1 ? 'inserted' : 'already exists'}`,
    );
  }
}

seed();
