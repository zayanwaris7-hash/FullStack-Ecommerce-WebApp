import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',//take schema fromschema .ts
  out: './drizzle',//migarated file are made inside drizzle folder
  dialect: 'postgresql', // we do postgresql drizzle internally set pg bcoz the work with
  dbCredentials: {
    url: process.env.DATABASE_URL !,
  },
});

// this for drizzle configration 