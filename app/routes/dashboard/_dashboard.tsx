import { Outlet, Link, useLoaderData, Form } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import type { User } from '@supabase/supabase-js';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { prisma } from '~/lib/db';
import { Role } from '@prisma/client';

interface LoaderData {
  user: User;
  userRole: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  const url = new URL(request.url);
  const isBaseDashboardPath = url.pathname === '/dashboard' || url.pathname === '/dashboard/';

  const dbUser = await prisma.user.findUnique({
    where: {
      email: data.user.email,
    },
    select: {
      role: true,
    },
  });

  const userRole = dbUser?.role || 'GENERAL';

  if (isBaseDashboardPath) {
    if (!dbUser) {
      return redirectWithHeaders('/auth/login', headers, { status: 401 });
    }
    if (dbUser.role === Role.ADMIN) {
      return redirectWithHeaders('/dashboard/admin', headers);
    }
    if (dbUser.role === Role.OWNER) {
      return redirectWithHeaders('/dashboard/owner', headers);
    }
    if (dbUser.role === Role.TENANT) {
      return redirectWithHeaders('/dashboard/tenant', headers);
    }
    if (dbUser.role === Role.PROPERTY_MANAGER) {
      return redirectWithHeaders('/dashboard/manager', headers);
    }
    if (dbUser.role === Role.SERVICE_PROVIDER) {
      return redirectWithHeaders('/dashboard/service', headers);
    }

    return redirectWithHeaders('/dashboard/general', headers);
  }

  return { user: data.user, userRole };
}

export default function DashboardLayout() {
  const { user, userRole } = useLoaderData<LoaderData>();
  console.log(user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary p-4 text-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Property Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email}</span>
            <Form method="post" action="/auth/logout">
              <Button
                className="text-primary hover:bg-opacity-90 rounded bg-white px-4 py-1 text-sm font-medium transition-colors"
                type="submit"
              >
                Sign out
              </Button>
            </Form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
          <nav className="space-y-1">
            <Link to="/dashboard" className="block rounded px-4 py-2 font-medium hover:bg-gray-100">
              Dashboard
            </Link>

            <div className="pt-2">
              {userRole === Role.OWNER && (
                <>
                  <Link
                    to="/dashboard/owner/properties"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    My Properties
                  </Link>
                  <Link
                    to="/dashboard/owner/rental-contracts"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Rental Contracts
                  </Link>
                  <Link
                    to="/dashboard/owner/events"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Events
                  </Link>
                </>
              )}

              {userRole === Role.ADMIN && (
                <>
                  <Link
                    to="/dashboard/admin/users"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Users
                  </Link>
                  <Link
                    to="/dashboard/admin/properties"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Properties
                  </Link>
                  <Link
                    to="/dashboard/admin/rental-contracts"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Rental Contracts
                  </Link>
                  <Link
                    to="/dashboard/admin/events"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Events
                  </Link>
                </>
              )}

              {userRole === Role.TENANT && (
                <>
                  <Link
                    to="/dashboard/tenant/lease"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    My Lease
                  </Link>
                  <Link
                    to="/dashboard/tenant/payments"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Payments
                  </Link>

                  <Link
                    to="/dashboard/tenant/events"
                    className="block rounded px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Events
                  </Link>
                </>
              )}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        <p>© 2025 Property Management. All rights reserved.</p>
      </footer>
    </div>
  );
}
