# Supabase Server-Side Authentication Guidelines

This document outlines our approach to server-side authentication using Supabase in our React Router 7 application.

## Overview

We use Supabase for authentication and data storage. In a React Router 7 application, we handle authentication primarily on the server side using loaders and actions.

## Server Client Utilities

In `app/lib/supabase.server.ts`, we have two main functions for working with Supabase on the server:

1. `getServerClient(request)`: Returns just the Supabase client
2. `createServerSupabase(request)`: Returns both the Supabase client and headers for cookie management

## Authentication Utility Functions

In `app/lib/auth.server.ts`, we provide several authentication helper functions built on top of the Supabase client:

1. `requireAuth(request)`: Ensures a user is authenticated. Redirects to login if not authenticated. Returns the user and headers.
2. `redirectIfAuthenticated(request, redirectTo)`: Redirects already authenticated users. Useful for login pages.
3. `getCurrentUser(request)`: Gets the current user if authenticated, returns null if not.
4. `logoutUser(request)`: Signs out the user and redirects to the login page.

## Response Utility Functions

In `app/lib/utils.ts`, we provide helper functions to safely handle redirects and JSON responses with authentication headers:

1. `redirectWithHeaders(url, headers, init?)`: Creates a redirect response with authentication headers
2. `jsonWithHeaders(data, headers, init?)`: Returns a JSON response with authentication headers

### Examples

**Using redirectWithHeaders:**

```typescript
// Redirect with authentication headers
const { supabase, headers } = createServerSupabase(request);
return redirectWithHeaders('/dashboard', headers);
```

**Using jsonWithHeaders:**

```typescript
// Return JSON data with authentication headers
const { supabase, headers } = createServerSupabase(request);
return jsonWithHeaders({ user: userData }, headers);
```

## Authentication in Routes

### Protected Routes

For routes that require authentication:

```typescript
import { createServerSupabase } from '~/lib/supabase.server';
import { jsonWithHeaders, redirectWithHeaders } from '~/lib/utils';
import type { User } from '@supabase/supabase-js';

// Define a type for the loader data
interface LoaderData {
  user: User;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle authentication in the loader
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  // Return the user data with headers
  return jsonWithHeaders({ user: data.user }, headers);
}

export default function ProtectedRoute() {
  const { user } = useLoaderData<LoaderData>();

  // Now you can safely use user data
  return <div>Hello {user.email}</div>;
}
```

### Public Routes (like login)

For pages that should redirect authenticated users:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already authenticated
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  // If user is authenticated, redirect to dashboard
  if (data.user) {
    return redirectWithHeaders('/dashboard', headers);
  }

  // Return any data needed for the login page
  return jsonWithHeaders({ message: 'Please log in' }, headers);
}
```

### When to Use Each Function

#### Use `getServerClient` when:

- You're only reading data and not changing authentication state
- You don't need to return headers in your response
- You're performing simple database queries

#### Use `createServerSupabase` when:

- You're handling authentication (sign in, sign up, sign out)
- You need to include Set-Cookie headers in your response
- You're modifying session state
- You're redirecting after authentication changes

#### Use Response Utility Functions When:

- You need to include authentication headers in responses
- You want to standardize how responses are created
- You're redirecting users with proper cookie handling

## Best Practices

1. **Never import server-only modules in client components**:
   React Router 7 with Vite will detect when server-side code is imported in client components.
   Always handle authentication in loaders and actions, not in the components themselves.

2. **Always include headers in responses**:
   Use the `redirectWithHeaders` and `jsonWithHeaders` utility functions to ensure cookies
   are properly included in all responses.

3. **Use appropriate type definitions**:
   Define interfaces for loader data to ensure proper type safety in your components.

4. **Check authentication in loaders for protected routes**:
   All routes that require authentication should check for a valid user in the loader function.

5. **Handle authentication errors gracefully**:
   Show appropriate error messages when authentication fails.

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Router 7 Documentation](https://reactrouter.com/)
- [Vite Documentation on Server/Client Code Splitting](https://vitejs.dev/guide/ssr.html)
