import { notFound } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';
import CheckInClient from '../../../components/events/CheckInClient';

export default async function EventCheckInPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const eventId = params.id;
  const token = typeof searchParams.token === 'string' ? searchParams.token : null;

  const supabase = createServerClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, is_public')
    .eq('id', eventId)
    .single();

  if (!event) notFound();

  const requiresName = !event.is_public;

  return (
    <CheckInClient
      eventId={eventId}
      eventTitle={event.title}
      startsAt={event.starts_at}
      endsAt={event.ends_at}
      isPublic={event.is_public}
      token={token}
      isOrganizer={false}
      requiresName={requiresName}
    />
  );
}