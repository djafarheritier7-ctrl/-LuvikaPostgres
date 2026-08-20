import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';

const ALLOWED_TABLES = [
  'profiles', 'events', 'companies', 'nfc_cards', 'orders', 'reviews',
  'follows', 'likes', 'portfolios', 'certificates', 'contact_requests',
  'event_participants', 'event_attendees', 'scans', 'subscriptions',
  'upgrade_requests', 'inactive_account_warnings', 'admin_actions',
  'user_feedback', 'profile_interactions', 'biometric_credentials',
  'card_configs', 'org_cards', 'parameters', 'user_blocks', 'nfc_orders'
];

function buildWhereClause(filters: any[]): { where: string; values: any[] } {
  if (!filters || filters.length === 0) return { where: '', values: [] };
  const clauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const filter of filters) {
    if (filter.op === 'or') {
      const orParts = filter.expr.split(',');
      const orClauses: string[] = [];
      for (const part of orParts) {
        const [column, op, value] = part.split('.');
        values.push(value);
        orClauses.push(`${column} ${mapOp(op)} $${paramIndex}`);
        paramIndex++;
      }
      clauses.push(`(${orClauses.join(' OR ')})`);
    } else {
      const { column, op, value } = filter;
      values.push(value);
      clauses.push(`${column} ${mapOp(op)} $${paramIndex}`);
      paramIndex++;
    }
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
}

function mapOp(op: string): string {
  switch (op) {
    case 'eq': return '=';
    case 'neq': return '<>';
    case 'gt': return '>';
    case 'lt': return '<';
    case 'gte': return '>=';
    case 'lte': return '<=';
    case 'ilike': return 'ILIKE';
    case 'in': return 'IN';
    case 'is': return 'IS';
    default: return '=';
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const select = searchParams.get('select') || '*';
  const filtersParam = searchParams.get('filters');
  const filters = filtersParam ? JSON.parse(filtersParam) : [];
  const limit = searchParams.get('limit');

  const { where, values } = buildWhereClause(filters);
  let query = `SELECT ${select} FROM ${table} ${where}`;
  const queryValues = [...values];

  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      query += ` LIMIT $${values.length + 1}`;
      queryValues.push(limitNum);
    }
  }

  try {
    const result = await pool.query(query, queryValues);
    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { payload, upsert, onConflict } = body;

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload manquant' }, { status: 400 });
  }

  try {
    if (upsert) {
      // ✅ Gestion de l'upsert avec ON CONFLICT
      const columns = Object.keys(payload);
      const values = Object.values(payload);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const conflictColumn = onConflict || 'id';

      // Construire la clause DO UPDATE SET colonne = EXCLUDED.colonne
      const updateClause = columns
        .filter(col => col !== conflictColumn)
        .map(col => `${col} = EXCLUDED.${col}`)
        .join(', ');

      const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (${conflictColumn})
        DO UPDATE SET ${updateClause}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } else {
      // Insertion simple
      const columns = Object.keys(payload);
      const values = Object.values(payload);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(query, values);
      return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    }
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Enregistrement déjà existant' }, { status: 409 });
    }
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { payload, filters } = body;

  if (!payload || !filters || filters.length === 0) {
    return NextResponse.json({ error: 'Payload ou filtres manquants' }, { status: 400 });
  }

  const setClauses = Object.keys(payload).map((col, i) => `${col} = $${i + 1}`);
  const setValues = Object.values(payload);

  const { where, values: whereValues } = buildWhereClause(filters);
  const allValues = [...setValues, ...whereValues];
  const setPlaceholders = setClauses.join(', ');

  const query = `UPDATE ${table} SET ${setPlaceholders} ${where} RETURNING *`;

  try {
    const result = await pool.query(query, allValues);
    return NextResponse.json({ data: result.rows[0] ?? null });
  } catch (error: any) {
    console.error('Erreur PUT:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { filters } = body;

  if (!filters || filters.length === 0) {
    return NextResponse.json({ error: 'Filtres manquants' }, { status: 400 });
  }

  const { where, values } = buildWhereClause(filters);
  const query = `DELETE FROM ${table} ${where} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    return NextResponse.json({ data: result.rows[0] ?? null });
  } catch (error: any) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}