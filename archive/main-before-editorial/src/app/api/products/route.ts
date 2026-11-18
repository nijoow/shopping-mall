import { getProductByProductId } from '@/lib/database/product';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productIds = new URLSearchParams(searchParams).getAll('productId');

  const users = await getProductByProductId(productIds.map(Number));

  return NextResponse.json(users);
}
