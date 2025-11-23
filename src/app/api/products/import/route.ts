import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Papa from 'papaparse';
import type { Product } from '@/lib/types';

type CsvProduct = Omit<Product, 'id' | 'status'> & { stock: string };

export async function POST(request: Request) {
  const db = await getDb();
  let added = 0;
  let skipped = 0;
  const duplicates: { name: string; existingId: number }[] = [];
  
  try {
    let productsToInsert: Partial<Product>[] = [];

    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      const csvText = await file.text();
      const parsed = Papa.parse<CsvProduct>(csvText, { header: true, skipEmptyLines: true });
      productsToInsert = parsed.data;
    } else {
      productsToInsert = await request.json();
    }
    
    if (!productsToInsert || productsToInsert.length === 0) {
        return NextResponse.json({ error: 'No products to import' }, { status: 400 });
    }

    const allDbProducts = await db.all('SELECT id, LOWER(name) as lower_name FROM products');
    const existingProductsMap = new Map(allDbProducts.map(p => [p.lower_name, p.id]));

    await db.run('BEGIN TRANSACTION');

    const stmt = await db.prepare('INSERT INTO products (name, unit, category, brand, stock, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)');

    for (const product of productsToInsert) {
      if (!product.name) {
        skipped++;
        continue;
      }

      const existingId = existingProductsMap.get(product.name.toLowerCase());
      if (existingId) {
        skipped++;
        duplicates.push({ name: product.name, existingId });
        continue;
      }
      
      const stock = Number(product.stock) || 0;
      const status = stock > 0 ? 'In Stock' : 'Out of Stock';
      const imageUrl = product.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(product.name)}/400/400`;
      
      await stmt.run(product.name, product.unit, product.category, product.brand, stock, status, imageUrl);
      added++;
    }
    
    await stmt.finalize();
    await db.run('COMMIT');

    return NextResponse.json({ added, skipped, duplicates });

  } catch (error: any) {
    await db.run('ROLLBACK');
    console.error('Failed to import products:', error);
    let errorMessage = 'Failed to import products';
    if(error.message.includes('UNIQUE constraint failed: products.name')) {
        errorMessage = 'One or more product names already exist in the database (case-sensitive check).'
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
