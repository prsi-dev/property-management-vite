import { parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CookieSerializeOptions } from 'react-router';

type CookieObject = { name: string; value: string };

// Create a Supabase admin client for admin operations (auth, etc.)
export const getAdminClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin operations');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }) as SupabaseClient;
};
export const createServerSupabase = (request: Request) => {
  const headers = new Headers();
  const supabase = createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');

          return cookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value ?? '',
          })) as CookieObject[];
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieSerializeOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          );
        },
      },
    }
  ) as SupabaseClient;

  return { supabase, headers };
};
