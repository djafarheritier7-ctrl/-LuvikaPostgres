// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 🔹 Vérification de sécurité
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // 🔹 Revalidate la page spécifique
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`, {
      cache: 'no-store',
    });

    return NextResponse.json({ revalidated: true, path });
  } catch (err) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}