import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Please add it to your .env.local file.\n' +
    'Get your Neon database URL from: https://neon.tech'
  );
}

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql });
