import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Papa from 'papaparse';
import type { Product } from '@/lib/types';

export async function GET() {
  try {
    const db = await getDb();
    const products: Product[] = await db.all('SELECT * FROM products');
    
    const csv = Papa.unparse(products);
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`);
    
    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error('Failed to export products:', error);
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
}
