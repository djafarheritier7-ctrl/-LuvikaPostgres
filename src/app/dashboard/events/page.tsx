import { redirect } from 'next/navigation';
import { createClientForPage } from '../../../../src/lib/supabase/server';
import EventAttendeesSection from '../../../../src/components/dashboard/EventAttendeesSection';

export default async function EventsPage() {
  const supabase = await createClientForPage();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📅 Événements</h1>
      <EventAttendeesSection plan={profile?.plan || null} />
    </div>
  );
}