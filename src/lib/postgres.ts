// src/lib/postgres.ts
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
export const query = (text: string, params?: any[]) => pool.query(text, params);