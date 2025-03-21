import { redirect } from 'react-router';
import { createServerSupabase } from './supabase.server';

export async function redirectIfAuthenticated(request: Request, redirectTo = '/dashboard') {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const response = redirect(redirectTo);
    headers.forEach((value, key) => {
      response.headers.append(key, value);
    });

    throw response;
  }

  return { headers };
}
