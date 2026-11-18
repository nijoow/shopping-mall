import { Categories, Gender, Product } from '@/types/types';
import { ColorFamily, getColorFamily } from '@/utils/colorFamily';
import { sql } from '@vercel/postgres';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { products } from './schema';

const db = drizzle(sql);

export const getProductByProductId = async (
  productIds: number[],
): Promise<Product[] | undefined> => {
  try {
    const product = await db
      .select()
      .from(products)
      .where(inArray(products.productId, productIds));

    return product;
  } catch (error) {
    throw new Error('Failed to fetch product.');
  }
};

export const getRecentProducts = async (): Promise<Product[] | undefined> => {
  try {
    const product = await sql<Product>`
        SELECT
              * 
        FROM 
            products 
        ORDER BY 
            "createdDate" DESC
        LIMIT 20   
    `;
    return product.rows;
  } catch (error) {
    throw new Error('Failed to fetch product.');
  }
};

export const getProducts = async ({
  category,
  gender,
  minPrice,
  maxPrice,
  keyword,
  colorFamily,
}: {
  category: Categories;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  colorFamily?: ColorFamily;
}): Promise<Product[] | undefined> => {
  try {
    const product = await sql<Product>`
      SELECT
          *
      FROM
          products
      WHERE
        (${category} = 'ALL' OR category = ${category})
        AND (${gender ?? null}::text IS NULL OR gender = ${gender ?? null})
        AND (${minPrice ?? null}::numeric IS NULL OR price >= ${minPrice ?? null})
        AND (${maxPrice ?? null}::numeric IS NULL OR price <= ${maxPrice ?? null})
        AND (${keyword ?? null}::text IS NULL OR "productName" ILIKE '%' || ${keyword ?? null} || '%')
      ORDER BY
        "createdDate" DESC
    `;

    // 상품 색상이 자유로운 hex 값이라 색상 계열 필터는 조회 후 분류로 처리한다
    if (!colorFamily) return product.rows;

    return product.rows.filter(({ colors }) =>
      colors.some(hex => getColorFamily(hex) === colorFamily),
    );
  } catch (error) {
    throw new Error('Failed to fetch product.');
  }
};
