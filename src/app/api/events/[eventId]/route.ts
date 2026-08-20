import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (DELETE):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Erreur suppression event:', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}