# Supabase Integration Documentation

## Overview

The property management system uses Supabase for:

- User Authentication
- Session Management with SSR Support
- Cookie-based Session Handling
- Admin Operations

## Client Setup

### Server-Side Client

```typescript
// lib/supabase.server.ts
import { parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { createClient, createServerClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Admin client for privileged operations
export const getAdminClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
};

// Server client with cookie handling
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
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          );
        },
      },
    }
  );

  return { supabase, headers };
};
```

## Authentication Implementation

### Login Flow

```typescript
// routes/auth/login.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { supabase, headers } = createServerSupabase(request);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonWithHeaders({ success: false, message: error.message }, headers);
  }

  return redirectWithHeaders('/dashboard', headers);
}
```

### Sign Up Flow

```typescript
// routes/auth/signup.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
```

### OAuth Callback

```typescript
// routes/auth/callback.tsx
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
```

## User Management

### Creating Users

```typescript
// api/users/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Create user in Prisma
  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role as Role,
      password: body.password,
      // ... other fields
    },
  });

  // Create user in Supabase Auth
  const supabaseAdmin = getAdminClient();
  const { error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });

  if (supabaseError) {
    // Rollback Prisma creation on Supabase error
    await prisma.user.delete({ where: { id: newUser.id } });
    throw new Error(supabaseError.message);
  }

  return newUser;
}
```

### Magic Link Authentication

```typescript
// api/users/create-with-magic-link/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Create user in both Prisma and Supabase
  const newUser = await prisma.user.create({ data: body });
  const supabaseAdmin = getAdminClient();

  // Create Supabase user
  await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });

  // Send magic link
  await supabaseAdmin.auth.signInWithOtp({
    email: body.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/dashboard`,
    },
  });
}
```

## Session Management

### Authentication Check

```typescript
// lib/auth.server.ts
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
```

## Development Setup

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Seeding Users

```typescript
// prisma/supabase-seed-utils.mjs
export const seedUserToSupabase = async (user, plainTextPassword) => {
  const supabaseAdmin = createSupabaseAdmin();

  // Check for existing user
  const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = usersList.users.find(u => u.email === user.email);

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: plainTextPassword,
    email_confirm: true,
    user_metadata: {
      prisma_id: user.id,
    },
  });

  if (error) throw error;
  return data.user;
};
```

## Security Best Practices

1. **Environment Variables**

   - Use separate keys for client and server operations
   - Never expose the service role key to the client
   - Store sensitive keys in secure environment variables

2. **Authentication Flow**

   - Implement proper email verification
   - Use secure password policies
   - Implement rate limiting for auth attempts
   - Handle session expiration gracefully

3. **Error Handling**

   - Implement proper error handling for auth operations
   - Roll back database operations on auth failures
   - Provide clear error messages to users

4. **Session Management**

   - Use secure cookie settings
   - Implement proper session refresh
   - Clear sessions on logout

5. **Admin Operations**
   - Use admin client only for privileged operations
   - Implement proper access control
   - Log sensitive operations
