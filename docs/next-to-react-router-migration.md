# Migrating from Next.js to React Router 7

This document outlines the process of migrating our Property Management System from Next.js to React Router 7 while maintaining the existing tech stack (Supabase, Prisma, and Shadcn UI).

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [New Project Structure](#new-project-structure)
3. [Setting Up the React Router 7 Project](#setting-up-the-react-router-7-project)
4. [Migrating Routes](#migrating-routes)
5. [Authentication with Supabase](#authentication-with-supabase)
6. [Database Access with Prisma](#database-access-with-prisma)
7. [UI Components with Shadcn UI](#ui-components-with-shadcn-ui)
8. [Data Fetching Strategies](#data-fetching-strategies)
9. [Deployment Considerations](#deployment-considerations)
10. [Testing the Migration](#testing-the-migration)

## Migration Overview

### Why Migrate from Next.js to React Router 7?

The decision to migrate from Next.js to React Router 7 is based on developer experience preferences. While Next.js provides a comprehensive framework with routing, server-side rendering, and API routes, React Router 7 offers a more flexible and lightweight approach that may better suit our development needs.

### Key Differences Between Next.js and React Router 7

| Feature               | Next.js                                     | React Router 7                                          |
| --------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Routing               | File-based routing                          | Component-based routing                                 |
| Data Fetching         | Server Components, getServerSideProps, etc. | Client-side with React hooks or data routers            |
| Server-Side Rendering | Built-in                                    | Requires additional setup (e.g., with Vite SSR)         |
| API Routes            | Built-in                                    | Requires separate backend or BFF (Backend for Frontend) |
| Build System          | Next.js build system                        | Vite (recommended)                                      |
| Application Structure | Opinionated                                 | Flexible                                                |

### Migration Strategy

1. **Incremental Migration**: Start with a new React Router 7 project and migrate routes and components incrementally.
2. **Functionality Parity**: Ensure all existing features work in the new setup before switching completely.
3. **Testing**: Thoroughly test each migrated component and route.

## New Project Structure

### Current Next.js Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── owner/
│   │   ├── tenant/
│   │   └── layout.tsx
│   ├── api/
│   ├── auth/
│   ├── login/
│   ├── signin/
│   ├── signup/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── hooks/
├── lib/
│   ├── db.ts
│   └── utils.ts
└── utils/
```

### Proposed React Router 7 Structure

```
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   └── RootLayout.tsx
│   └── ui/
├── routes/
│   ├── _root.tsx             # Root route layout
│   ├── _dashboard.tsx        # Dashboard layout route
│   ├── admin/
│   │   ├── _index.tsx        # Admin dashboard index
│   │   └── [specific routes].tsx
│   ├── owner/
│   │   ├── _index.tsx        # Owner dashboard index
│   │   └── [specific routes].tsx
│   ├── tenant/
│   │   ├── _index.tsx        # Tenant dashboard index
│   │   └── [specific routes].tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   └── index.tsx             # Home page
├── hooks/
│   ├── useAuth.ts
│   └── [other hooks].ts
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── supabase.ts           # Supabase client
│   └── utils.ts
├── contexts/
│   └── AuthContext.tsx
├── services/
│   └── api.ts                # API service for backend calls
├── utils/
├── App.tsx                   # Main application component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Setting Up the React Router 7 Project

### Using the React Router Vercel Template

To set up your project using the React Router Vercel template, follow these steps:

1. **Clone the Template Repository**

   Start by cloning the React Router template for Vercel:

   ```bash
   git clone https://github.com/remix-run/react-router-templates.git
   cd react-router-templates/vercel
   ```

2. **Install Dependencies**

   Navigate to the `vercel` directory and install the necessary dependencies:

   ```bash
   npm install
   ```

3. **Development Setup**

   Start the development server with Hot Module Replacement (HMR):

   ```bash
   npm run dev
   ```

   Your application will be available at `http://localhost:3000`.

4. **Project Structure**

   The template provides a structured setup with the following key features:

   - **Server-side Rendering**: Optimized for performance and SEO.
   - **Hot Module Replacement**: For a seamless development experience.
   - **TailwindCSS**: Pre-configured for styling.

5. **Customizing the Template**

   - **Routing Configuration**: Update the `react-router.config.ts` file to define your routes using the `RouteConfig` approach.
   - **Styling**: Customize the TailwindCSS setup in `tailwind.config.js` to match your design requirements.
   - **Environment Variables**: Set up your `.env` file with necessary environment variables for Supabase and other services.

6. **Deployment**

   The template is optimized for deployment on Vercel. You can deploy your application by connecting your repository to Vercel and following their deployment process.

### Key Points

- **Template Benefits**: This template provides a robust starting point with modern features like server-side rendering and HMR, which are beneficial for both development and production environments.

- **Integration with Existing Setup**: You can integrate your existing components, hooks, and services into this template, ensuring a smooth transition from your current Next.js setup.

- **Flexibility and Customization**: The template is designed to be flexible, allowing you to customize routing, styling, and other configurations to fit your specific needs.

By using this template, you can leverage the latest features of React Router 7 and Vercel's deployment capabilities, ensuring a high-performance and scalable application.

## Migrating Routes

### Configure React Router 7 with RouteConfig

To use the `@react-router/dev/routes` package for a more structured routing configuration, follow these steps:

1. **Install the `@react-router/dev` package** if you haven't already:

   ```bash
   npm install @react-router/dev
   ```

2. **Create a new router configuration file** using the `RouteConfig` approach. Here's an example based on your provided structure:

   ```tsx
   // src/router.tsx
   import { type RouteConfig, route, index, layout, prefix } from '@react-router/dev/routes';

   export default [
     index('./routes/index.tsx'), // Home page
     route('about', './routes/about.tsx'), // About page

     layout('./components/layout/AuthLayout.tsx', [
       route('login', './routes/auth/login.tsx'),
       route('register', './routes/auth/register.tsx'),
     ]),

     ...prefix('dashboard', [
       index('./routes/dashboard/index.tsx'),
       route('admin', './routes/dashboard/admin.tsx'),
       route('owner', './routes/dashboard/owner.tsx'),
       route('tenant', './routes/dashboard/tenant.tsx'),
     ]),
   ] satisfies RouteConfig;
   ```

3. **Update your entry point** to use this new router configuration:

   ```tsx
   // src/main.tsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { RouterProvider } from 'react-router-dom';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import routes from './router';
   import './index.css';

   const queryClient = new QueryClient();

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <QueryClientProvider client={queryClient}>
         <RouterProvider routes={routes} />
       </QueryClientProvider>
     </React.StrictMode>
   );
   ```

### Key Points

- **Route Definitions**: Use `index`, `route`, `layout`, and `prefix` to define your routes. This approach allows for a more declarative and organized way to manage routes, especially in larger applications.

- **Layouts**: Use the `layout` function to define routes that share a common layout component. This is useful for sections of your app that have a consistent UI structure, like authentication or dashboard areas.

- **Route Prefixing**: The `prefix` function helps in grouping related routes under a common path prefix, which is useful for organizing routes by feature or section.

- **Type Safety**: The `satisfies RouteConfig` ensures that your route definitions conform to the expected structure, providing type safety and reducing runtime errors.

This approach should integrate smoothly with your existing setup and provide a more flexible and maintainable routing configuration.

## Authentication with Supabase

### Setup Supabase Client

Create `src/lib/supabase.ts`:

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Authentication Context

Create `src/contexts/AuthContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      }

      setUser(data?.session?.user || null);
      setIsLoading(false);

      // Set up auth listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        if (authListener) {
          authListener.subscription.unsubscribe();
        }
      };
    };

    fetchSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
```

Update `main.tsx` to include the `AuthProvider`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import routes from './router';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider routes={routes} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Database Access with Prisma

### Prisma Client Setup

Create `src/lib/db.ts` (similar to your existing setup):

```tsx
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Create an API Service Layer

Since React Router doesn't have built-in API routes like Next.js, create an API service layer:

```tsx
// src/services/api.ts
import { supabase } from '../lib/supabase';

// Example function to fetch protected data
export async function fetchProtectedData(endpoint: string) {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${session.session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}

// Add more API functions as needed
```

### Backend for Frontend (BFF)

Since React Router doesn't include a built-in API solution like Next.js, you'll need to set up a separate backend or BFF. Options include:

1. Using Vite's proxy feature for development
2. Creating a separate Express server
3. Using a serverless function provider like Vercel or Netlify Functions

Example with Express backend:

```tsx
// server/index.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(express.json());

// Middleware to verify Supabase JWT
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Protected routes
app.get('/api/users/me', verifyAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add more API routes as needed

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## UI Components with Shadcn UI

Shadcn UI components can be used in React Router 7 the same way as in Next.js. Import and use them in your React components as needed.

Example Button component:

```tsx
// src/components/ui/Button.tsx
import { Button as ShadcnButton } from '@/components/ui/button';

export function Button({ children, ...props }) {
  return <ShadcnButton {...props}>{children}</ShadcnButton>;
}
```

## Data Fetching Strategies

### Using React Query (TanStack Query)

React Query is a powerful tool for fetching, caching, and updating data in React applications:

```tsx
// Example of using React Query in a component
import { useQuery } from '@tanstack/react-query';
import { fetchProtectedData } from '../services/api';

function UserDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userData'],
    queryFn: () => fetchProtectedData('users/me'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {data.name}</h1>
      {/* Display user data */}
    </div>
  );
}
```

### Using React Router 7 Data APIs

React Router 7 introduces a data API that can be used for data fetching:

```tsx
// In your router configuration
import { createBrowserRouter } from 'react-router-dom';
import { fetchUserData } from './services/api';

const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    loader: async () => {
      return fetchUserData();
    },
    children: [
      // Child routes
    ],
  },
]);

// In your component
import { useLoaderData } from 'react-router-dom';

function Dashboard() {
  const userData = useLoaderData();

  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      {/* Display dashboard content */}
    </div>
  );
}
```

## Deployment Considerations

### Building for Production

Update your `package.json` to include build and start scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "serve": "vite preview",
    "start": "node server/index.js"
  }
}
```

### Environment Variables

Create a `.env` file in your project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For production, ensure your hosting provider supports setting environment variables.

### Static Site Hosting

If using a separate backend:

1. Build your React app with `npm run build`
2. Host the built files on a static hosting service (Vercel, Netlify, etc.)
3. Deploy your API backend separately

### Serverless Functions

For services like Vercel or Netlify, you can use serverless functions instead of a separate Express backend:

```tsx
// netlify/functions/api.ts
import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const handler: Handler = async (event, context) => {
  // Implement API logic here

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};

export { handler };
```

## Testing the Migration

### Incremental Testing Strategy

1. Start with migrating basic routes and components
2. Test authentication flow
3. Test data fetching with Prisma and Supabase
4. Test UI components and layouts
5. Test complex features

### Side-by-Side Testing

Run both the Next.js app and React Router app side by side to compare functionality and ensure nothing is missed during migration.

### Automated Testing

Consider adding automated tests to ensure functionality works as expected:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Example test:

```tsx
// src/components/Auth/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('renders correctly', () => {
    render(<LoginForm onSubmit={() => {}} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

## Conclusion

This migration guide provides a comprehensive roadmap for transitioning from Next.js to React Router 7 while preserving your existing tech stack (Supabase, Prisma, and Shadcn UI). The transition will require careful planning and incremental implementation, but the result will be a more flexible and lightweight application architecture.

Key points to remember:

1. React Router 7 requires more manual setup than Next.js, especially for routing and API endpoints
2. Authentication with Supabase needs to be implemented with a context provider
3. Database access with Prisma remains largely the same
4. UI components with Shadcn UI can be used in the same way
5. Data fetching strategies need to be adapted for the new architecture

By following this guide, you should be able to successfully migrate your Property Management System from Next.js to React Router 7 with minimal disruption to your development workflow.
