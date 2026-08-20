import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { generateQRBase64 } from '../../../../lib/qr';

const shortenId = (id: string) => id.substring(0, 6).replace(/[+/]/g, 'x').toLowerCase();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const profileId = searchParams.get('id');

  if (!username && !profileId) {
    return NextResponse.json({ error: 'username ou id requis' }, { status: 400 });
  }

  const supabase = createServerClient();

  // 🔹 Récupère le profil
  let profile;
  if (profileId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    profile = p;
  } else {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username!)
      .single();
    profile = p;
  }

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  // 🔹 Helpers
  const getBase64FromUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch {
      return null;
    }
  };

  const [avatarBase64, logoBase64] = await Promise.all([
    getBase64FromUrl(profile.avatar_url),
    getBase64FromUrl(profile.company_logo_url as string | null),
  ]);

  // 🔹 Génère le QR code du lien court (en base64 PNG)
  const shortId = shortenId(profile.id);
  const shortUrl = `https://luvika.me/u/${shortId}`;
  let qrBase64: string | null = null;
  try {
    qrBase64 = await generateQRBase64(shortUrl, { size: 300, type: 'png' });
  } catch (err) {
    console.warn('⚠️ QR generation failed for vCard');
  }

  // 🔹 Construit la vCard Pro+
  let vCard = `BEGIN:VCARD\r\nVERSION:4.0\r\n`;

  // 🔹 Identité
  vCard += `FN:${profile.full_name || 'Utilisateur LUVIKA'}\r\n`;
  if (profile.username) vCard += `NICKNAME:${profile.username}\r\n`;
  if (profile.job_title) vCard += `TITLE:${profile.job_title}\r\n`;
  if (profile.company) vCard += `ORG:${profile.company}\r\n`;

  // 🔹 Photo & Logo
  if (avatarBase64) {
    vCard += `PHOTO;ENCODING=b;TYPE=JPEG:${avatarBase64}\r\n`;
  }
  if (logoBase64) {
    vCard += `LOGO;ENCODING=b;TYPE=PNG:${logoBase64}\r\n`;
  }

  // 🔹 QR Code (champ étendu — standard vCard 4.0)
  if (qrBase64) {
    vCard += `X-QR-CODE;ENCODING=b;TYPE=PNG:${qrBase64}\r\n`;
  }

  // 🔹 Contacts
  if (profile.email) vCard += `EMAIL:${profile.email}\r\n`;
  if (profile.phone) vCard += `TEL;TYPE=work,voice:${profile.phone}\r\n`;
  if (profile.whatsapp) vCard += `TEL;TYPE=cell,voice,whatsapp:+${profile.whatsapp.replace(/\D/g, '')}\r\n`;
  if (profile.address) vCard += `ADR;TYPE=work:;;${profile.address};;;;\r\n`;

  // 🔹 Liens & Note
  vCard += `URL:${shortUrl}\r\n`;
  if (profile.website) vCard += `URL:${profile.website}\r\n`;
  vCard += `NOTE:LUVIKA Pro — ${shortUrl}\r\n`;

  // 🔹 Fin
  vCard += `END:VCARD\r\n`;

  return new NextResponse(vCard, {
    headers: {
      'Content-Type': 'text/vcard;charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.username || 'contact'}.vcf"`,
    },
  });
}