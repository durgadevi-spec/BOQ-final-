const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Bypass SSL cert validation for development (Supabase pooler issue)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Determine connection string: prefer process.env, fallback to .env at repo root
let connectionString = process.env.DATABASE_URL || null;
if (!connectionString) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const m1 = envContent.match(/DATABASE_URL="([^"]+)"/);
    const m2 = envContent.match(/DATABASE_URL=(.+)/);
    connectionString = m1 ? m1[1] : (m2 ? m2[1].trim() : null);
  }
}

if (!connectionString) {
  console.error('No DATABASE_URL found in environment or .env');
  process.exit(1);
}

console.log('Using connection string preview:', connectionString.substring(0, 60) + '...');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase pooler requires this
});

async function createMessagesTable() {
  const client = await pool.connect();
  try {
    console.log('Ensuring pgcrypto extension exists...');
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
      console.log('✓ pgcrypto extension ensured');
    } catch (extErr) {
      console.warn('Could not create pgcrypto extension (may already exist or not permitted):', extErr.message || extErr);
    }

    console.log('Creating messages table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_name TEXT NOT NULL,
        sender_email TEXT,
        sender_role TEXT,
        message TEXT NOT NULL,
        info TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_role ON messages (sender_role)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at)`);
    console.log('✅ messages table ensured');
  } catch (err) {
    console.error('Failed to create messages table:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

createMessagesTable().then(() => process.exit(process.exitCode || 0));
