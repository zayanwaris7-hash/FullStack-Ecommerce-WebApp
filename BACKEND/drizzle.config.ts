import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // Matches your pg driver
  dbCredentials: {
    url: process.env.DATABASE_URL !,
  },
});