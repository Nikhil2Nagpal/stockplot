import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { InventoryLog } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const db = await getDb();
    const history: InventoryLog[] = await db.all(
      'SELECT * FROM inventory_logs WHERE productId = ? ORDER BY timestamp DESC',
      id
    );
    return NextResponse.json(history);
  } catch (error) {
    console.error(`Failed to fetch history for product ${id}:`, error);
    return NextResponse.json({ error: `Failed to fetch history for product ${id}` }, { status: 500 });
  }
}
