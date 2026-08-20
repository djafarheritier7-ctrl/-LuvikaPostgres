import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    const supabase = createServerClient();

    const sessionResult = await supabase.auth.getSession();
    const session = sessionResult.data.session;
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isOwner = session.user.id === user_id;
    const isAdmin = session.user.user_metadata?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data } = await supabase
      .from('scans')
      .select(`
        created_at,
        scan_type,
        scanner_ip,
        profiles!inner(full_name, username)
      `)
      .eq('profile_id', user_id)
      .order('created_at', { ascending: false });

    if (!data) {
      return NextResponse.json({ error: 'Aucun scan trouvé' }, { status: 404 });
    }

    const csvRows = [
      ['Date', 'Type', 'IP', 'Visiteur'],
      ...data.map((row: { profiles: any[]; created_at: string | number | Date; scan_type: any; scanner_ip: any; }) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return [
          new Date(row.created_at).toLocaleString('fr-FR'),
          row.scan_type || 'inconnu',
          row.scanner_ip || 'anonyme',
          profile?.full_name || profile?.username || 'anonyme',
        ];
      })
    ];

    const csv = csvRows
      .map(row => 
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="scans_${user_id}.csv"`,
      },
    });

  } catch (err: any) {
    console.error('Erreur export CSV:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la génération du CSV' },
      { status: 500 }
    );
  }
}