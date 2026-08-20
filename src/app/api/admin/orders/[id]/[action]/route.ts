import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ParamsSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['validate', 'cancel']),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
  const rawParams = await context.params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { id, action } = parsed.data;

  const supabase = createServerClient();

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const status = action === 'validate' ? 'processing' : 'cancelled';

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Erreur:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}