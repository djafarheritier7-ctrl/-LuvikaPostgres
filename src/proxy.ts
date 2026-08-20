// src/proxy.ts
import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const cookieString = request.cookies.toString();
  const supabase = createServerClient(cookieString);

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // ✅ Routes publiques : toujours accessibles
  const publicPaths = [
    '/auth/sign-in', '/auth/sign-up', '/auth/forgot-password',
    '/auth/callback', '/auth/error', '/auth/update-password',
    '/', '/privacy', '/terms', '/cookies', '/contact',
  ];
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // ✅ Routes protégées : si pas connecté → redirection vers sign-in
  const protectedPaths = ['/dashboard', '/admin', '/complete-profile'];
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  if (isProtectedPath && !user) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(signInUrl);
  }

  // ✅ Vérification onboarding pour dashboard
  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done, role, plan')
      .eq('id', user.id)
      .single();

    if (!profile || profile.onboarding_done !== true) {
      // Ne pas rediriger si on est déjà sur complete-profile
      if (path !== '/complete-profile') {
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
    }

    // ✅ Vérification entreprise
    const isEnterprise = profile?.plan?.toLowerCase() === 'entreprise';
    const isAdmin = profile?.role === 'admin';

    if (isEnterprise || isAdmin) {
      // Si on est dans les routes entreprise
      if (path.startsWith('/dashboard/entreprise')) {
        const isSetupRoute = path.startsWith('/dashboard/entreprise/setup');

        // Si pas sur une page de setup, vérifier que l'entreprise est configurée
        if (!isSetupRoute) {
          const { data: company } = await supabase
            .from('companies')
            .select('id, company_type, company_config, name')
            .eq('owner_id', user.id)
            .single();

          // Pas d'entreprise du tout
          if (!company) {
            return NextResponse.redirect(new URL('/dashboard/entreprise/setup', request.url));
          }

          // Entreprise existe mais pas de type choisi
          if (!company.company_type) {
            return NextResponse.redirect(new URL('/dashboard/entreprise/setup', request.url));
          }

          // Entreprise a un type mais pas configurée
          const hasConfig = company.company_config && Object.keys(company.company_config).length > 0;

          if (!hasConfig) {
            // Routes autorisées sans configuration complète
            const allowedWithoutConfig = [
              '/dashboard/entreprise',
              '/dashboard/entreprise/settings',
            ];

            const isAllowed = allowedWithoutConfig.some(p => path === p || path.startsWith(p + '/'));

            if (!isAllowed) {
              return NextResponse.redirect(
                new URL(`/dashboard/entreprise/setup/${company.company_type}`, request.url)
              );
            }
          }
        }
      }

      // Admin : vérifier l'accès aux routes admin
      if (path.startsWith('/admin') && !isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // ✅ Redirection events vers locale par défaut
  if (path.startsWith('/events/')) {
    return NextResponse.redirect(new URL(path.replace('/events/', '/fr/events/'), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|static|.*\\..*|favicon.ico|sw.js).*)',
  ],
};