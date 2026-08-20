// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { createClientForAction } from '../../../lib/supabase/server';

export async function POST() {
  const supabase = await createClientForAction(); // ✅ Autorise set/remove
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}