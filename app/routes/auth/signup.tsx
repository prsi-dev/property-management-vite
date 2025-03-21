import { Link, Form, redirect, useNavigation, useActionData } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { redirectIfAuthenticated } from '../../lib/auth.server';
import { createServerSupabase } from '~/lib/supabase.server';

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = registerSchema.safeParse({ email, password, confirmPassword });
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { supabase } = createServerSupabase(request);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return redirect('/auth/login?registered=true');
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (actionData && !actionData.success && actionData.message) {
    toast.error(actionData.message);
  }

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
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to create your account
          </p>
        </div>
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
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm leading-none font-medium">
                  Password
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
                  Confirm Password
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
                  'Create Account'
                )}
              </button>
            </div>
          </Form>
        </div>
        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
