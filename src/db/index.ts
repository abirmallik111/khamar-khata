import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://shenron:abirmallik76922247@192.168.1.8:5432/main_db';

// For query execution
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export { client };
