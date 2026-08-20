// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Logo Luvika (base64 - version simplifiée, ou utilisez une URL CDN)
const LUVITA_LOGO_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app'}/logo.png`;

export async function POST(request: NextRequest) {
  // ✅ Vérification de la clé API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY manquante');
    return NextResponse.json(
      { error: 'Service email non configuré' },
      { status: 500 }
    );
  }
  const resend = new Resend(resendApiKey);

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Template HTML pour l'admin (inchangé)
    const adminEmailHtml = `...`; // (votre template HTML admin)

    // Template HTML pour l'utilisateur (inchangé)
    const userEmailHtml = `...`; // (votre template HTML utilisateur)

    // Envoi des emails
    const [adminEmailResult, userEmailResult] = await Promise.allSettled([
      resend.emails.send({
        from: 'Luvika <onboarding@resend.dev>',
        to: ['phakunestor@gmail.com'],
        subject: `🔔 Nouveau message de contact - ${name}`,
        replyTo: email,
        text: `Nom: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        html: adminEmailHtml,
      }),
      resend.emails.send({
        from: 'Luvika <onboarding@resend.dev>',
        to: [email],
        subject: '✅ Confirmation - Nous avons bien reçu votre message',
        text: `Merci ${name} ! Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nCopie de votre message :\n${message}`,
        html: userEmailHtml,
      })
    ]);

    if (adminEmailResult.status === 'rejected' && userEmailResult.status === 'rejected') {
      console.error('Échec des deux envois:', adminEmailResult.reason, userEmailResult.reason);
      throw new Error('Échec de l\'envoi des emails');
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur API contact:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi. Veuillez réessayer.'
      },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour échapper les caractères HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}