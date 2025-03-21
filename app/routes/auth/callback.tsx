import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { createServerSupabase } from '../../lib/supabase.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return redirect('/auth/login');
  }

  const { supabase } = createServerSupabase(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/dashboard');
}

export default function AuthCallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
        <h1 className="text-2xl font-semibold">Processing authentication...</h1>
        <p className="text-muted-foreground">You&apos;ll be redirected shortly.</p>
      </div>
    </div>
  );
}
