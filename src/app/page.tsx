import InventoryManagementSystem from "@/app/_components/inventory-management-system";
import { getDb } from "@/lib/db";
import type { Product } from "@/lib/types";

// This is a server component to fetch initial data
export default async function Home() {
  const db = await getDb();
  
  // Fetch initial products sorted by name
  const initialProducts: Product[] = await db.all('SELECT * FROM products ORDER BY id DESC');
  
  // Fetch unique categories
  const categoriesResult: { category: string }[] = await db.all('SELECT DISTINCT category FROM products ORDER BY category ASC');
  const categories = categoriesResult.map(c => c.category);

  return (
    <InventoryManagementSystem initialProducts={initialProducts} categories={categories} />
  );
}
