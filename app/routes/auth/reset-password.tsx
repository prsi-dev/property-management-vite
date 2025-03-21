import { useState, useEffect } from 'react';
import { Form, redirect, useNavigation, useActionData, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { redirectIfAuthenticated } from '../../lib/auth.server';
import { createServerSupabase } from '~/lib/supabase.server';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);

  const url = new URL(request.url);
  const hasAuthParams = url.hash.includes('access_token') || url.hash.includes('error_description');

  return { hasAuthParams };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { supabase } = createServerSupabase(request);
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return redirect('/auth/login?reset=success');
}

export default function ResetPassword() {
  const { hasAuthParams } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [isProcessing, setIsProcessing] = useState(hasAuthParams);

  useEffect(() => {
    if (hasAuthParams) {
      const handleHashFragment = async () => {
        try {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);

          const errorDescription = params.get('error_description');
          if (errorDescription) {
            toast.error(decodeURIComponent(errorDescription));
            setIsProcessing(false);
            return;
          }

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            window.history.replaceState(null, '', window.location.pathname);
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Error processing reset password URL:', error);
          toast.error('Failed to process reset password link. Please try again.');
          setIsProcessing(false);
        }
      };

      handleHashFragment();
    }
  }, [hasAuthParams]);

  if (actionData && !actionData.success && actionData.message) {
    toast.error(actionData.message);
  }

  const {
    register,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  if (isProcessing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
          <h1 className="text-2xl font-semibold">Processing reset link...</h1>
          <p className="text-muted-foreground">Please wait while we validate your reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below</p>
        </div>

        <div className="grid gap-6">
          <Form method="post" noValidate>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm leading-none font-medium">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="border-input focus-visible:ring-ring bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  autoComplete="new-password"
                  {...register('password')}
                  name="password"
                />
                {(errors.password || actionData?.errors?.password) && (
                  <p className="text-destructive text-sm">
                    {errors.password?.message || (actionData?.errors?.password?.[0] as string)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm leading-none font-medium">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="border-input focus-visible:ring-ring bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  name="confirmPassword"
                />
                {(errors.confirmPassword || actionData?.errors?.confirmPassword) && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword?.message ||
                      (actionData?.errors?.confirmPassword?.[0] as string)}
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
                  'Reset Password'
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
