import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateVisibilitySchema = z.object({
  user_id: z.string().uuid(),
  sections_visibility: z.record(
    z.enum(['bio', 'contact', 'social', 'portfolio', 'certificates']),
    z.boolean()
  ),
});

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateVisibilitySchema.parse(body);

    if (session.user.id !== parsed.user_id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ sections_visibility: parsed.sections_visibility })
      .eq('id', parsed.user_id)
      .select('sections_visibility')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ sections-visibility API error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}