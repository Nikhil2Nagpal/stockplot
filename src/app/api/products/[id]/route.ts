import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    const db = await getDb();
    const body: Partial<Product> = await request.json();

    const { name, unit, category, brand, stock } = body;
    
    if (!name || !unit || !category || !brand || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (stock < 0) {
      return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
    }

    const existingNameProduct = await db.get('SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND id != ?', [name, id]);
    if (existingNameProduct) {
        return NextResponse.json({ error: `Product name "${name}" already exists.` }, { status: 409 });
    }

    const existingProduct = await db.get<Product>('SELECT * FROM products WHERE id = ?', id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newStatus = stock > 0 ? 'In Stock' : 'Out of Stock';

    await db.run('BEGIN TRANSACTION');

    if (stock !== existingProduct.stock) {
      await db.run(
        'INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy, date, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        existingProduct.stock,
        stock,
        'admin',
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
    
    const result = await db.run(
      'UPDATE products SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ? WHERE id = ?',
      name, unit, category, brand, stock, newStatus, id
    );

    await db.run('COMMIT');
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found or no changes made' }, { status: 404 });
    }

    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', id);
    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    await (await getDb()).run('ROLLBACK');
    console.error(`Failed to update product ${id}:`, error);
     if (error.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: 'Product name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: `Failed to update product ${id}` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM products WHERE id = ?', id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Also clear related logs
    await db.run('DELETE FROM inventory_logs WHERE productId = ?', id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return NextResponse.json({ error: `Failed to delete product ${id}` }, { status: 500 });
  }
}
