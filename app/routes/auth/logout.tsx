import { redirect } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  await supabase.auth.signOut();

  return redirectWithHeaders('/auth/login', headers);
}

export async function loader() {
  return redirect('/auth/login');
}

export default function Logout() {
  redirect('/auth/login');
  return <div className="flex h-screen items-center justify-center">Logging out...</div>;
}
