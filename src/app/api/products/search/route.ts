import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    const products: Product[] = await db.all(
      'SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC',
      `%${name}%`
    );
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to search products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
