// src/app/u/[shortId]/page.tsx
import { redirect } from 'next/navigation';
import { createClientForPage } from '../../../../src/lib/supabase/server'; // ✅ Corrigé

export default async function ShortRedirect({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  const supabase = await createClientForPage(); // ✅ Utilise la fonction existante
  const { data : profiles } = await supabase
    .from('profiles')
    .select('username')
    .ilike('id', `${shortId}%`)
    .limit(1);

  if (profiles?.[0]?.username) {
    redirect(`/${profiles[0].username}`);
  }
  return redirect('/');
}