import { Product } from '@/types/types';
import { sql } from '@vercel/postgres';

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
