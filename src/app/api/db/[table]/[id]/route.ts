import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ table: string; id: string }> }) {
  const { table, id } = await params;
  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ table: string; id: string }> }) {
  const { table, id } = await params;
  const body = await request.json();
  const payload = body.payload || body;

  const columns = Object.keys(payload).filter(col => col !== 'id');
  const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
  const values = columns.map(col => payload[col]);

  const query = `UPDATE ${table} SET ${setClauses} WHERE id = $${columns.length + 1} RETURNING *`;
  values.push(id);

  try {
    const result = await pool.query(query, values);
    return NextResponse.json({ data: result.rows[0] ?? null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ table: string; id: string }> }) {
  const { table, id } = await params;
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return NextResponse.json({ data: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}