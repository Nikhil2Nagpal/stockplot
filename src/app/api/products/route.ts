import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const db = await getDb();
    
    let query = 'SELECT * FROM products';
    const params: string[] = [];

    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC';

    const products: Product[] = await db.all(query, params);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
