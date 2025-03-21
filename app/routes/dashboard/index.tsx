import { Link, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { createServerSupabase } from '~/lib/supabase.server';
import { jsonWithHeaders, redirectWithHeaders } from '~/lib/utils';
import { prisma } from '~/lib/db';

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findMany();

    console.log('Found user in database:', dbUser);
  } catch (error) {
    console.error('Error fetching user from database:', error);
  }

  return jsonWithHeaders({ user: data.user, dbUser }, headers);
}

export default function Dashboard() {
  const { user, dbUser } = useLoaderData<typeof loader>() as {
    user: { id: string; email: string };
    dbUser: { name: string; role: string };
  };
  console.log('Auth user:', user);
  console.log('DB user:', dbUser);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Welcome back!</h2>
          <p className="text-muted-foreground mb-4">
            You are signed in as: <span className="font-medium">{user?.email}</span>
          </p>
          {dbUser && (
            <p className="text-muted-foreground mb-4">
              Name: <span className="font-medium">{dbUser?.name}</span>
              {dbUser?.role && (
                <>
                  {' '}
                  | Role: <span className="font-medium">{dbUser.role}</span>
                </>
              )}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              to="/dashboard/admin"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Admin Panel
            </Link>
            <Link
              to="/dashboard/owner"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Owner Portal
            </Link>
            <Link
              to="/dashboard/tenant"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Tenant Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Properties</h3>
          <p className="text-muted-foreground mb-4">Manage your properties and units</p>
          <div className="mt-4">
            <Link to="#" className="text-primary text-sm font-medium hover:underline">
              View Properties →
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Leases</h3>
          <p className="text-muted-foreground mb-4">Review and manage lease agreements</p>
          <div className="mt-4">
            <Link to="#" className="text-primary text-sm font-medium hover:underline">
              View Leases →
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Maintenance</h3>
          <p className="text-muted-foreground mb-4">Track maintenance requests and work orders</p>
          <div className="mt-4">
            <Link to="#" className="text-primary text-sm font-medium hover:underline">
              View Maintenance →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
