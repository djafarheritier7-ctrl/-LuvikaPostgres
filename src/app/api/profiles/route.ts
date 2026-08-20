import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'username requis' }, { status: 400 });
  }

  const supabase = createServerClient();

  const cleanUsername = username.trim().toLowerCase();

  console.log('🔍 Searching for username:', { 
    original: username, 
    cleaned: cleanUsername 
  });

  // Strategy 1: Exact match (case-insensitive)
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', cleanUsername)
    .maybeSingle();

  console.log('📊 Strategy 1 (ilike exact):', { data: !!data, error: error?.message });

  // Strategy 2: Pattern match if exact match fails
  if (!data && !error) {
    console.log('🔄 Trying pattern match...');
    const result = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${cleanUsername}%`)
      .limit(1)
      .maybeSingle();
    
    data = result.data;
    error = result.error;
    
    console.log('📊 Strategy 2 (pattern match):', { data: !!data, error: error?.message });
  }

  // Strategy 3: Get all usernames for debugging (limit to 10)
  if (!data && !error) {
    console.log('📋 Fetching sample usernames for debugging...');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('username')
      .limit(10);
    
    console.log('Available usernames:', allProfiles?.map((p: { username: any; }) => p.username));
  }

  if (error) {
    console.error('❌ Supabase error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }

  if (!data) {
    console.warn('⚠️ Profile not found for:', cleanUsername);
    return NextResponse.json({ 
      error: 'Profil introuvable', 
      searched: cleanUsername,
      hint: 'Vérifiez l\'orthographe du nom d\'utilisateur'
    }, { status: 404 });
  }

  console.log('✅ Profile found:', data.username);
  return NextResponse.json(data);
}