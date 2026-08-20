// src/lib/supabase-shim.ts
// Shim Supabase compatible avec une API interne (Next.js + PostgreSQL)
// Imite la surface Supabase utilisée dans le repo.

type SupabaseResponse<T> = { data: T | null; error: any | null };

function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const u = new URL(base, origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export function createClient() {
  return makeShimClient({ clientSide: true });
}

// ✅ createServerClient accepte maintenant un cookieString
export function createServerClient(cookieString?: string) {
  return makeShimClient({ clientSide: false, cookieString });
}

export function createBrowserClient() {
  return makeShimClient({ clientSide: true });
}

function makeShimClient(opts: { clientSide?: boolean; cookieString?: string } = {}) {
  const baseApi =
    process.env.NEXT_PUBLIC_API_URL && !opts.clientSide
      ? process.env.NEXT_PUBLIC_API_URL
      : '';

  // ===================== AUTH =====================
  const auth = {
    async getUser(token?: string) {
      const url = (baseApi || '') + '/api/auth/me';
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      if (opts.cookieString) headers.Cookie = opts.cookieString;

      const res = await fetch(url, {
        credentials: 'include',
        headers,
      });
      if (!res.ok) return { data: { user: null }, error: await res.text() };
      const payload = await res.json();
      return { data: { user: payload.user || null }, error: null };
    },

    async getSession() {
      const url = (baseApi || '') + '/api/auth/session';
      const res = await fetch(url, {
        credentials: 'include',
        headers: opts.cookieString ? { Cookie: opts.cookieString } : undefined,
      });
      if (!res.ok) return { data: { session: null }, error: await res.text() };
      const payload = await res.json();
      return { data: { session: payload.session || null }, error: null };
    },

    async signUp(credentials: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string; username?: string } };
    }) {
      const res = await fetch((baseApi || '') + '/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          full_name: credentials.options?.data?.full_name || null,
          username: credentials.options?.data?.username || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        return { data: { user: null, session: null }, error: payload.error || 'Erreur d’inscription' };
      }
      return { data: { user: payload.user, session: payload.session || null }, error: null };
    },

    async signInWithPassword(credentials: { email: string; password: string }) {
      const res = await fetch((baseApi || '') + '/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const payload = await res.json();
      if (!res.ok) {
        return { data: { user: null, session: null }, error: payload.error || 'Identifiants invalides' };
      }
      return { data: { user: payload.user, session: { user: payload.user } }, error: null };
    },

    async signOut() {
      await fetch((baseApi || '') + '/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
        headers: opts.cookieString ? { Cookie: opts.cookieString } : undefined,
      });
      return { error: null };
    },

    async resetPasswordForEmail(email: string) {
      const res = await fetch((baseApi || '') + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json();
      if (!res.ok) return { error: payload.error || 'Erreur lors de l’envoi' };
      return { error: null };
    },

    async verifyOtp(params: { token_hash: string; type: string }) {
      const res = await fetch((baseApi || '') + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const payload = await res.json();
      if (!res.ok) return { error: payload.error || 'Token invalide' };
      return { error: null };
    },

    async updateUser(attributes: { password: string }) {
      let tokenHash: string | null = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        tokenHash = urlParams.get('token_hash');
      }
      if (!tokenHash) return { error: 'Token manquant' };

      const res = await fetch((baseApi || '') + '/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_hash: tokenHash,
          password: attributes.password,
        }),
      });
      const payload = await res.json();
      if (!res.ok) return { error: payload.error || 'Erreur de mise à jour' };
      return { error: null };
    },

    onAuthStateChange(_cb: Function) {
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },

    admin: {
      async getUserById(_id: string) {
        return { data: { user: null }, error: 'Not implemented in shim' };
      },
      async listUsers(_options?: any) {
        return { data: { users: [] }, error: null };
      },
      async deleteUser(_id: string) {
        return { data: null, error: null };
      },
    },
  };

  // ===================== DATABASE =====================
  function from(table: string) {
    const state: any = {
      table,
      op: 'select',
      select: '*',
      filters: [],
    };

    const builder: any = {
      select(sel?: string) {
        state.select = sel || '*';
        return builder;
      },
      insert(payload: any) {
        state.op = 'insert';
        state.payload = payload;
        return builder;
      },
      update(payload: any) {
        state.op = 'update';
        state.payload = payload;
        return builder;
      },
      delete() {
        state.op = 'delete';
        return builder;
      },
      // ✅ Ajout de la méthode upsert
      upsert(payload: any, options?: any) {
        state.op = 'upsert';
        state.payload = payload;
        state.onConflict = options?.onConflict || 'id';
        return builder;
      },

      // Filtres
      eq(column: string, value: any) {
        state.filters.push({ op: 'eq', column, value });
        return builder;
      },
      neq(column: string, value: any) {
        state.filters.push({ op: 'neq', column, value });
        return builder;
      },
      gt(column: string, value: any) {
        state.filters.push({ op: 'gt', column, value });
        return builder;
      },
      lt(column: string, value: any) {
        state.filters.push({ op: 'lt', column, value });
        return builder;
      },
      lte(column: string, value: any) {
        state.filters.push({ op: 'lte', column, value });
        return builder;
      },
      gte(column: string, value: any) {
        state.filters.push({ op: 'gte', column, value });
        return builder;
      },
      in(column: string, values: any[]) {
        state.filters.push({ op: 'in', column, value: values });
        return builder;
      },
      is(column: string, value: any) {
        state.filters.push({ op: 'is', column, value });
        return builder;
      },
      ilike(column: string, pattern: string) {
        state.filters.push({ op: 'ilike', column, value: pattern });
        return builder;
      },
      or(expr: string) {
        state.filters.push({ op: 'or', expr });
        return builder;
      },

      limit(n: number) {
        state.limit = n;
        return builder;
      },
      order(column: string, opts?: any) {
        state.order = { column, ...opts };
        return builder;
      },

      maybeSingle() {
        return execute(true);
      },
      single() {
        return execute(true);
      },

      then(resolve: any, reject: any) {
        return execute(false).then(resolve, reject);
      },
    };

    async function execute(requireSingle: boolean) {
      const base = (baseApi || '') + `/api/db/${encodeURIComponent(table)}`;
      let method = 'GET';
      if (state.op === 'insert' || state.op === 'upsert') method = 'POST';
      else if (state.op === 'update') method = 'PUT';
      else if (state.op === 'delete') method = 'DELETE';

      if (method === 'GET') {
        const params: any = { select: state.select };
        if (state.limit) params.limit = state.limit;
        params.filters = JSON.stringify(state.filters);
        const fullUrl = buildUrl(base, params);
        const res = await fetch(fullUrl, {
          credentials: 'include',
          headers: opts.cookieString ? { Cookie: opts.cookieString } : undefined,
        });
        const body = await res.json().catch(() => ({}));
        return {
          data: body.data
            ? requireSingle
              ? Array.isArray(body.data)
                ? body.data[0] ?? null
                : body.data
              : body.data
            : null,
          error: body.error || null,
        };
      } else {
        const fetchOptions: RequestInit = {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(opts.cookieString ? { Cookie: opts.cookieString } : {}),
          },
          body: JSON.stringify({
            payload: state.payload,
            filters: state.filters,
            upsert: state.op === 'upsert',
            onConflict: state.onConflict,
          }),
        };
        const res = await fetch(base, fetchOptions);
        const body = await res.json().catch(() => ({}));
        return { data: body.data ?? null, error: body.error ?? null };
      }
    }

    return builder;
  }

  return {
    auth,
    from,
    functions: {
      invoke: async () => {
        throw new Error('Edge functions not implemented in shim');
      },
    },
  };
}

export default { createClient, createServerClient, createBrowserClient };