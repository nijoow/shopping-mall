import { Categories, Gender, Product } from '@/types/types';
import { sql } from '@vercel/postgres';

export const getProductByProductId = async (
  productId: number,
): Promise<Product | undefined> => {
  try {
    const user = await sql<Product>`
        SELECT 
            * 
        FROM 
            products 
        WHERE 
            "productId" = (${productId})
    `;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw new Error('Failed to fetch product.');
  }
};

export const getRecentProducts = async (): Promise<Product[] | undefined> => {
  try {
    const user = await sql<Product>`
        SELECT
              * 
        FROM 
            products 
        ORDER BY 
            "createdDate" DESC
        LIMIT 10   
    `;
    return user.rows;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw new Error('Failed to fetch product.');
  }
};

export const getProducts = async ({
  category,
  gender,
  minPrice,
  maxPrice,
  colors,
}: {
  category: Categories;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
}): Promise<Product[] | undefined> => {
  try {
    const colorsValue = colors?.join(',');

    const user = await sql<Product>`
      SELECT
          * 
      FROM 
          products 
      WHERE 
        (${category} = 'ALL' OR category = ${category})
        AND (${gender}::text IS NULL OR gender = ${gender})
        AND (${minPrice}::numeric IS NULL OR price >= ${minPrice})
        AND (${maxPrice}::numeric IS NULL OR price <= ${maxPrice})
    `;

    return user.rows;
  } catch (error) {
    throw new Error('Failed to fetch product.');
  }
};
