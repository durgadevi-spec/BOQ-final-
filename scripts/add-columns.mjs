import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const client = new pg.Client({ connectionString });

async function addColumns() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add missing columns
    await client.query(`
      ALTER TABLE material_submissions 
      ADD COLUMN IF NOT EXISTS dimensions VARCHAR
    `);
    console.log('✓ Added dimensions column');
    
    await client.query(`
      ALTER TABLE material_submissions 
      ADD COLUMN IF NOT EXISTS finishtype VARCHAR
    `);
    console.log('✓ Added finishtype column');
    
    await client.query(`
      ALTER TABLE material_submissions 
      ADD COLUMN IF NOT EXISTS metaltype VARCHAR
    `);
    console.log('✓ Added metaltype column');
    
    console.log('\n✓ All columns added successfully!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await client.end();
    process.exit(1);
  }
}

addColumns();
