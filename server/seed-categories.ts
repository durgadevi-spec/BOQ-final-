import { query } from './db/client';

export async function seedMaterialCategories(): Promise<void> {
  try {
    console.log('[seed-categories] Creating material_categories table if not exists...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS material_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255)
      )
    `);
    
    console.log('[seed-categories] ✓ material_categories table ready');

    console.log('[seed-categories] Creating material_subcategories table if not exists...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS material_subcategories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        UNIQUE(name, category)
      )
    `);
    
    console.log('[seed-categories] ✓ material_subcategories table ready');
  } catch (err: any) {
    console.error('[seed-categories] Error creating category tables:', err.message || err);
    // Don't throw - this is non-critical
  }
}
