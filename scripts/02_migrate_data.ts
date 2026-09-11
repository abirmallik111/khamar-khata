/**
 * KHAMAR KHATA - DATA MIGRATION SCRIPT
 * Pulls existing records from managed Supabase (lfuwowkkwulmbkgirkch)
 * and inserts them into target PostgreSQL database.
 * 
 * Usage:
 *   1. Ensure target DB schema is applied: psql $TARGET_DATABASE_URL -f scripts/01_schema.sql
 *   2. Run: npx tsx scripts/02_migrate_data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfuwowkkwulmbkgirkch.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdXdvd2trd3VsbWJrZ2lya2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mjg2MDYsImV4cCI6MjA5MjIwNDYwNn0.aNyRBt897vTuH6aUBUBUyUpTYu0m4pIlkx2x6w62rac';

const TARGET_DB_URL = process.env.DATABASE_URL || 'postgresql://shenron:abirmallik76922247@192.168.1.8:5432/main_db';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const pgClient = new Client({ connectionString: TARGET_DB_URL });

const TABLES = [
  'profiles',
  'expense_categories',
  'goats',
  'expenses',
  'expense_goat_map',
  'sales',
  'owners',
  'owner_contributions',
  'goat_health_records',
  'goat_notes',
  'goat_images'
];

async function migrate() {
  console.log('🚀 Starting Data Migration from Supabase to Target Postgres...');
  await pgClient.connect();

  try {
    for (const table of TABLES) {
      console.log(`\n📦 Fetching table: ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`❌ Error fetching ${table} from Supabase:`, error.message);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Table ${table} is empty. Skipping.`);
        continue;
      }

      console.log(`  Found ${data.length} records in ${table}. Inserting into target DB...`);

      for (const row of data) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
          INSERT INTO ${table} (${keys.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
          ${keys.map((k) => `${k} = EXCLUDED.${k}`).join(', ')};
        `;

        await pgClient.query(query, values);
      }
      console.log(`  ✅ Successfully migrated ${data.length} records into ${table}.`);
    }

    console.log('\n🎉 Migration process completed successfully!');
  } catch (err: any) {
    console.error('\n💥 Migration failed:', err.message);
  } finally {
    await pgClient.end();
  }
}

migrate();
