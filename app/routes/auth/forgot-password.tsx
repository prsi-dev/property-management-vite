import { useState } from 'react';
import { Link, Form, useNavigation, useActionData } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { jsonWithHeaders, redirectWithHeaders } from '~/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return redirectWithHeaders('/dashboard', headers);
  }

  return jsonWithHeaders({}, headers);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    const { headers } = createServerSupabase(request);
    return jsonWithHeaders(
      {
        success: false,
        errors: result.error.flatten().fieldErrors,
      },
      headers
    );
  }

  const origin = new URL(request.url).origin;

  const { supabase, headers } = createServerSupabase(request);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return jsonWithHeaders(
      {
        success: false,
        message: error.message,
      },
      headers
    );
  }

  return jsonWithHeaders(
    {
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    },
    headers
  );
}

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const actionData = useActionData<typeof action>() as
    | { success: boolean; message: string; errors: Record<string, string[]> }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success && !emailSent) {
    setEmailSent(true);
    toast.success(actionData.message);
  }

  if (actionData && !actionData.success && actionData.message) {
    toast.error(actionData.message);
  }

  const {
    register,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {emailSent ? (
          <div className="border-border rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Check your email</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  We&apos;ve sent you a password reset link. Please check your inbox.
                </p>
              </div>
              <Link
                to="/auth/login"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <Form method="post" noValidate>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm leading-none font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="border-input focus-visible:ring-ring bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...register('email')}
                    name="email"
                  />
                  {(errors.email || actionData?.errors?.email) && (
                    <p className="text-destructive text-sm">
                      {errors.email?.message || (actionData?.errors?.email?.[0] as string)}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </Form>
            <div className="text-center text-sm">
              <Link to="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
