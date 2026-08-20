import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data: event } = await supabase
    .from('events')
    .select('profile_id, title')
    .eq('id', eventId)
    .single();

  if (!event || event.profile_id !== user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { data: parts } = await supabase
    .from('event_participants')
    .select('name, email, is_checked_in, checked_in_at, created_at')
    .eq('event_id', eventId);

  if (!parts || parts.length === 0) {
    return new NextResponse('Aucun participant', { status: 200 });
  }

  const headers = ['Nom', 'Email', 'Présent', 'Heure arrivée', 'Inscrit le'];
  const rows = parts.map((p: { name: any; email: string; is_checked_in: any; checked_in_at: string | number | Date; created_at: string | number | Date; }) =>
    [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.email ? `"${p.email.replace(/"/g, '""')}"` : '""',
      p.is_checked_in ? 'Oui' : 'Non',
      p.checked_in_at ? new Date(p.checked_in_at).toLocaleString('fr-FR') : '',
      p.created_at ? new Date(p.created_at).toLocaleString('fr-FR') : ''
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return new NextResponse(blob, {
    headers: {
      'Content-Disposition': `attachment; filename="participants-${event.title?.replace(/\s+/g, '_') || 'event'}_${eventId}.csv"`,
      'Content-Type': 'text/csv',
    },
  });
}