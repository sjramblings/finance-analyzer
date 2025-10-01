import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/transactions.db');
const categoriesPath = path.join(__dirname, '../config/categories.json');

async function initDatabase() {
  console.log('🔧 Initializing database...');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  await fs.mkdir(dataDir, { recursive: true });

  // Read schema from backend
  const schemaPath = path.join(__dirname, '../backend/src/db/schema.ts');
  const schemaContent = await fs.readFile(schemaPath, 'utf-8');

  // Extract SQL from the export const schema = `...`
  const match = schemaContent.match(/export const schema = `([\s\S]*?)`/);
  if (!match) {
    throw new Error('Could not extract schema from schema.ts');
  }
  const schema = match[1];

  // Create database and execute schema
  const db = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log('✅ Database schema created');

  // Load default categories
  const categoriesData = await fs.readFile(categoriesPath, 'utf-8');
  const categories = JSON.parse(categoriesData);

  console.log(`📦 Loading ${categories.length} default categories...`);

  for (const category of categories) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO categories (name, icon, color, is_system) VALUES (?, ?, ?, 1)',
        [category.name, category.icon, category.color],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  console.log('✅ Default categories loaded');

  await new Promise((resolve) => db.close(resolve));

  console.log('🎉 Database initialization complete!');
  console.log(`📍 Database location: ${dbPath}`);
}

initDatabase().catch((error) => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});
