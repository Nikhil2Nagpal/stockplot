import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { PlaceHolderImages } from './placeholder-images';

// Use a global variable to hold the database connection, so it's not re-initialized on every request in serverless environments.
let db: Database | undefined;

const seedProducts = [
    { name: "Pro Laptop 15", unit: "pcs", category: "Electronics", brand: "TechCorp", stock: 50, imageUrl: PlaceHolderImages[0].imageUrl },
    { name: "SmartPhone X", unit: "pcs", category: "Electronics", brand: "Connect", stock: 150, imageUrl: PlaceHolderImages[1].imageUrl },
    { name: "AudioMax Headphones", unit: "pcs", category: "Audio", brand: "SoundWave", stock: 0, imageUrl: PlaceHolderImages[2].imageUrl },
    { name: "BrewMaster Coffee Machine", unit: "pcs", category: "Home Appliances", brand: "KitchenPro", stock: 30, imageUrl: PlaceHolderImages[3].imageUrl },
    { name: "Explorer Backpack", unit: "pcs", category: "Accessories", brand: "OutdoorGear", stock: 75, imageUrl: PlaceHolderImages[4].imageUrl },
    { name: "Alpha DSLR Camera", unit: "pcs", category: "Photography", brand: "LensKing", stock: 25, imageUrl: PlaceHolderImages[5].imageUrl },
    { name: "TimeKeeper Smartwatch", unit: "pcs", category: "Wearables", brand: "FitTech", stock: 90, imageUrl: PlaceHolderImages[6].imageUrl },
    { name: "QuickBoil Kettle", unit: "pcs", category: "Home Appliances", brand: "KitchenPro", stock: 40, imageUrl: PlaceHolderImages[7].imageUrl },
    { name: "ErgoComfort Office Chair", unit: "pcs", category: "Furniture", brand: "OfficeLux", stock: 15, imageUrl: PlaceHolderImages[8].imageUrl },
    { name: "SoundBox Mini Speaker", unit: "pcs", category: "Audio", brand: "SoundWave", stock: 0, imageUrl: PlaceHolderImages[9].imageUrl },
    { name: "GamerPro Mouse", unit: "pcs", category: "Electronics", brand: "TechCorp", stock: 120, imageUrl: PlaceHolderImages[10].imageUrl },
    { name: "TypeRight Mechanical Keyboard", unit: "pcs", category: "Electronics", brand: "TechCorp", stock: 60, imageUrl: PlaceHolderImages[11].imageUrl },
];

async function initializeDb() {
    console.log("Initializing database...");
    
    // For Vercel/serverless, always use in-memory. For local dev, use a file.
    const isProduction = process.env.NODE_ENV === 'production';
    const dbPath = isProduction ? ':memory:' : './stockpilot.db';

    const newDb = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
    
    await newDb.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        stock INTEGER NOT NULL,
        status TEXT NOT NULL,
        imageUrl TEXT
      );
    `);
    
    try {
      await newDb.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_product_name ON products (LOWER(name));');
    } catch(e) {
      console.warn("Could not create unique index, it might already exist.", e);
    }

    await newDb.exec(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        date TEXT NOT NULL,
        oldStock INTEGER NOT NULL,
        newStock INTEGER NOT NULL,
        changedBy TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
    
    const productCountResult = await newDb.get('SELECT COUNT(*) as count FROM products');
    if (productCountResult && productCountResult.count === 0) {
        const stmt = await newDb.prepare('INSERT INTO products (name, unit, category, brand, stock, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const p of seedProducts) {
            const status = p.stock > 0 ? 'In Stock' : 'Out of Stock';
            await stmt.run(p.name, p.unit, p.category, p.brand, p.stock, status, p.imageUrl);
        }
        await stmt.finalize();
        console.log('Database seeded with initial products.');
    }
    console.log("Database initialized.");
    return newDb;
}

export async function getDb() {
    // In serverless environments, we need to use the global object to persist the database connection across function invocations.
    if (!global._db) {
        global._db = await initializeDb();
    }
    return global._db;
}
