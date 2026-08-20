import { useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase-shim';

// Types locaux minimaux pour remplacer @supabase/supabase-js
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
};

type Session = {
  user: User | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const userRole = profile?.role || session.user.user_metadata?.role || 'user';
        setRole(userRole === 'admin' ? 'admin' : 'user');
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    loadUser();

    // Écoute les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const userRole = profile?.role || session.user.user_metadata?.role || 'user';
        setRole(userRole === 'admin' ? 'admin' : 'user');
      } else {
        setUser(null);
        setRole(null);
      }
    });

    // Nettoyage à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    isConnected: !!role,
  };
}