'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

const PUBLIC_ROUTES = [
  '/', '/auth', '/about', '/contact', '/pricing', '/download',
  '/privacy', '/terms', '/cookies', '/blog',
  '/fr', '/en', '/ln', '/kg', '/sw', '/pt', '/nl', '/es', '/ar'
]

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // 🔹 Accepte tous les chemins localisés publics : /fr, /en, /fr/about, etc.
      const isPublicPath = 
        PUBLIC_ROUTES.includes(pathname) ||
        /^\/[a-z]{2}(\/[^\/]*)?$/.test(pathname) || // /fr, /fr/anything
        /^\/[a-z]{2}\/about/.test(pathname) ||
        /^\/[a-z]{2}\/contact/.test(pathname) ||
        /^\/[a-z]{2}\/pricing/.test(pathname);

      if (isPublicPath) {
        setChecking(false)
        setIsAuthorized(true)
        return
      }

      // 🔹 Routes protégées : vérifier la session
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // ✅ User connecté
          setIsAuthorized(true)
        } else {
          // ❌ Pas de session
          setIsAuthorized(false)
          // ⚠️ NE PAS rediriger ici — le middleware s'en charge
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
        setIsAuthorized(false)
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [pathname])

  // ✅ Autorisé ou public → affiche le contenu
  return <>{children}</>
}