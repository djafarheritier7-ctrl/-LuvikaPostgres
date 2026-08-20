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

function isSafeIdentifier(name: string) {
  return typeof name === 'string' && /^[a-zA-Z0-9_]+$/.test(name);
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

function buildWhereClause(filters: any[]): { where: string; values: any[] } {
  if (!filters || filters.length === 0) return { where: '', values: [] };
  const clauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const filter of filters) {
    // Refuse raw expr/or usage for safety — ask client to send structured filters
    if (filter.op === 'or' && filter.expr) {
      throw new Error('Operator "or" with raw expr is not supported for security reasons. Use multiple filters or a structured OR array.');
    }

    const { column, op, value } = filter;
    if (!isSafeIdentifier(column)) {
      throw new Error(`Invalid column name: ${String(column)}`);
    }

    if (op === 'in') {
      const arr = Array.isArray(value) ? value : (String(value).split(',').map((v: string) => v.trim()));
      if (arr.length === 0) continue;
      const placeholders = arr.map(() => `$${paramIndex++}`).join(', ');
      values.push(...arr);
      clauses.push(`${column} IN (${placeholders})`);
      continue;
    }

    if (op === 'is') {
      if (value === null || String(value).toLowerCase() === 'null') {
        clauses.push(`${column} IS NULL`);
        continue;
      } else if (String(value).toLowerCase() === 'not null') {
        clauses.push(`${column} IS NOT NULL`);
        continue;
      }
    }

    values.push(value);
    clauses.push(`${column} ${mapOp(op)} $${paramIndex++}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const select = searchParams.get('select') || '*';

  // Reject relational selects like profiles(...) which the handler cannot translate
  if (select.includes('(') || select.includes(')')) {
    return NextResponse.json({ error: 'Select relationnel non supporté. Utilisez des colonnes simples.' }, { status: 400 });
  }

  const filtersParam = searchParams.get('filters');
  const filters = filtersParam ? JSON.parse(filtersParam) : [];
  const limit = searchParams.get('limit');

  try {
    const { where, values } = buildWhereClause(filters);
    let query = `SELECT ${select} FROM ${table} ${where}`;
    const queryValues: any[] = [...values];

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query += ` LIMIT $${queryValues.length + 1}`;
        queryValues.push(limitNum);
      }
    }

    const result = await pool.query(query, queryValues);
    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
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
    const columns = Object.keys(payload);
    if (!columns.every(isSafeIdentifier)) {
      return NextResponse.json({ error: 'Nom de colonne invalide' }, { status: 400 });
    }

    if (upsert) {
      // ✅ Gestion de l'upsert avec ON CONFLICT
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

  try {
    const columns = Object.keys(payload);
    if (!columns.every(isSafeIdentifier)) {
      return NextResponse.json({ error: 'Nom de colonne invalide' }, { status: 400 });
    }

    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    const setValues = Object.values(payload);

    const { where, values: whereValues } = buildWhereClause(filters);
    const allValues = [...setValues, ...whereValues];
    const setPlaceholders = setClauses.join(', ');

    const query = `UPDATE ${table} SET ${setPlaceholders} ${where} RETURNING *`;

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

  try {
    const { where, values } = buildWhereClause(filters);
    const query = `DELETE FROM ${table} ${where} RETURNING *`;

    const result = await pool.query(query, values);
    return NextResponse.json({ data: result.rows[0] ?? null });
  } catch (error: any) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
