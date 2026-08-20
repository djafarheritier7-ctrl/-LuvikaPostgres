import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idResult = z.string().uuid().safeParse(params.id);
    if (!idResult.success) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }
    const orderId = idResult.data;

    const body = await request.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    const { status } = parsed.data;

    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, status, profiles(full_name, email)');

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: `Statut mis à jour : ${status}`,
      order: null
    });
  } catch (error: any) {
    console.error('❌ Erreur update-status:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' }, 
      { status: error.status || 500 }
    );
  }
}