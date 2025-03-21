import { useEffect } from 'react';
import { Link, useLoaderData, Form, useNavigation, useActionData } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { jsonWithHeaders, redirectWithHeaders } from '~/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface ActionSuccess {
  success: true;
}

interface ActionError {
  success: false;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
}

type ActionData = ActionSuccess | ActionError;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return redirectWithHeaders('/dashboard', headers);
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
  const registered = url.searchParams.get('registered') === 'true';
  const reset = url.searchParams.get('reset') === 'success';
  const error = url.searchParams.get('error');

  return jsonWithHeaders({ redirectTo, registered, reset, error }, headers);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

  const result = loginSchema.safeParse({ email, password });
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

  const { supabase, headers } = createServerSupabase(request);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
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

  return redirectWithHeaders(redirectTo, headers);
}

export default function Login() {
  const { redirectTo, registered, reset, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (registered) {
      toast.success('Registration successful! Please check your email for verification.');
    }

    if (reset) {
      toast.success('Password has been reset successfully!');
    }

    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [registered, reset, error]);

  useEffect(() => {
    if (actionData && !actionData.success && actionData.message) {
      toast.error(actionData.message);
    }
  }, [actionData]);

  const {
    register,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="container flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="bg-primary absolute inset-0" />
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Property Management
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has streamlined our property management process, making it easier
              to manage properties and tenants.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] lg:p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and password to sign in to your account
          </p>
        </div>
        <div className="grid gap-6">
          <Form method="post" noValidate>
            <input type="hidden" name="redirectTo" value={redirectTo} />
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
                {(errors.email ||
                  (actionData && !actionData.success && actionData.errors?.email)) && (
                  <p className="text-destructive text-sm">
                    {errors.email?.message ||
                      (actionData &&
                        !actionData.success &&
                        (actionData.errors?.email?.[0] as string))}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm leading-none font-medium">
                    Password
                  </label>
                  <Link to="/auth/forgot-password" className="text-primary text-sm hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="border-input focus-visible:ring-ring bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  autoComplete="current-password"
                  {...register('password')}
                  name="password"
                />
                {(errors.password ||
                  (actionData && !actionData.success && actionData.errors?.password)) && (
                  <p className="text-destructive text-sm">
                    {errors.password?.message ||
                      (actionData &&
                        !actionData.success &&
                        (actionData.errors?.password?.[0] as string))}
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
                  'Sign In'
                )}
              </button>
            </div>
          </Form>
        </div>
        <div className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
