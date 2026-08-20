import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForPage();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ enabled: false });
    }

    const { data: creds, error } = await supabase
      .from('biometric_credentials')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ enabled: creds.length > 0 });
  } catch (error) {
    console.error('Biometric status error:', error);
    return NextResponse.json({ enabled: false });
  }
}