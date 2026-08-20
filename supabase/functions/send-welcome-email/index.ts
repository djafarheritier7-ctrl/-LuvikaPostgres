// supabase/functions/send-welcome-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Edge Function 'send-welcome-email' starting...");

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { user_id } = await req.json();

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, username, email')
      .eq('id', user_id)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: 'Utilisateur introuvable' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const baseUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://luvika.vercel.app';
    const qrCodeUrl = `${baseUrl}/api/qr?username=${encodeURIComponent(profile.username)}`;
    const profileUrl = `${baseUrl}/${profile.username}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'LUVIKA <noreply@luvika.dev>',
        to: profile.email,
        subject: '✅ Votre compte LUVIKA est activé !',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px;">LUVIKA</h1>
              <p style="color: #64748b; margin-top: 8px;">Révèle qui tu es</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0;">
                Bonjour <strong style="color: white;">${profile.full_name}</strong>,
              </p>
              <p style="color: #cbd5e1; margin: 0 0 20px 0;">
                Votre compte LUVIKA est activé 🎉<br/>
                Votre profil : 
                <a href="${profileUrl}" 
                   style="color: #38bdf8; text-decoration: none;">
                  ${profileUrl}
                </a>
              </p>
              
              <div style="text-align: center; margin: 20px 0;">
                <img src="${qrCodeUrl}" alt="QR Code" width="200" style="border-radius: 8px; background: white; padding: 8px;" />
                <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">
                  Scannez pour accéder à votre profil
                </p>
              </div>
            </div>

            <div style="font-size: 14px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
              <p style="margin: 0;">Équipe LUVIKA • Kinshasa, RDC</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `luvika-${profile.username}-qr.png`,
            content: await (await fetch(qrCodeUrl)).arrayBuffer(),
          }
        ],
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ 
        error: `Resend failed: ${err.error?.message || 'Unknown'}` 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      email: profile.email,
      qr_url: qrCodeUrl
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});