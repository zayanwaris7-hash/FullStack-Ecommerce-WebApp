//making connection to db  , its for creating all the table in db
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import 'dotenv/config';


if (process.env.DATABASE_URL === undefined) {
  throw new Error('DATABASE_URL environment variable is not set');
}
// Create the connection pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with the pool and your schema
export const db = drizzle(pool, { schema });