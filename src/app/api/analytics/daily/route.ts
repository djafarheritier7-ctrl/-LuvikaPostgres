import { createServerClient } from '@/src/lib/supabase-shim';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const profile_id = request.nextUrl.searchParams.get('profile_id');
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
    }

    const supabase = createServerClient();

    // ✅ AUTH SÉCURISÉE
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // ✅ CONTRÔLE D'ACCÈS
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', profile_id)
      .single();

    const isAdmin = user.user_metadata?.role === 'admin';
    const isOwner = user.id === profile_id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔹 Requête sur la table scans
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: scans, error } = await supabase
      .from('scans')
      .select('created_at, scan_type')
      .eq('profile_id', profile_id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 🔹 Agréger les données par jour
    const dailyCounts = scans.reduce((acc: any, scan: any) => {
      const date = new Date(scan.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, scan_count: 0, qr_count: 0, nfc_count: 0 };
      }
      acc[date].scan_count++;
      if (scan.scan_type === 'nfc') {
        acc[date].nfc_count++;
      } else {
        acc[date].qr_count++;
      }
      return acc;
    }, {});

    const result = Object.values(dailyCounts).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('❌ Erreur analytics:', err);
    return NextResponse.json({ error: 'Échec du chargement' }, { status: 500 });
  }
}