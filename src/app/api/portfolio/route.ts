import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: portfolios, error: pErr } = await supabase
    .from('portfolios')
    .select('*')
    .eq('profile_id', profileId)
    .order('position', { ascending: true });

  const { data: certificates, error: cErr } = await supabase
    .from('certificates')
    .select('*')
    .eq('profile_id', profileId)
    .order('date_issued', { ascending: false });

  if (pErr || cErr) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }

  return NextResponse.json({ portfolios, certificates });
}

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { type, data } = body;
  let table = type === 'portfolio' ? 'portfolios' : 'certificates';
  let insertData = { ...data, profile_id: user.id };

  const { data: inserted, error } = await supabase
    .from(table)
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(inserted);
}

export async function PUT(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { type, id, ...updates } = body;

  let table = type === 'portfolio' ? 'portfolios' : 'certificates';
  const { error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .eq('profile_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) return NextResponse.json({ error: 'id & type required' }, { status: 400 });

  let table = type === 'portfolio' ? 'portfolios' : 'certificates';
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}