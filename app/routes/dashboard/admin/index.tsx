import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import type { User } from '@supabase/supabase-js';
import { JoinRequestsList } from '~/components/dashboard/join-requests-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { jsonWithHeaders } from '~/lib/utils';
import { redirectWithHeaders } from '~/lib/utils';
import { createServerSupabase } from '~/lib/supabase.server';

// Define a type for the loader data
interface LoaderData {
  user: User | null;
}

export async function loader({ request: request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  return jsonWithHeaders({ user: data.user }, headers);
}

export default function AdminDashboard() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Welcome, Admin {user?.email ? `(${user?.email})` : ''}
        </h2>
        <p className="text-gray-600">
          This is the administration panel where you can manage all aspects of the property
          management system.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Join Requests</h2>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0">
          <JoinRequestsList statusFilter="PENDING" />
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          <JoinRequestsList statusFilter="APPROVED" />
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          <JoinRequestsList statusFilter="REJECTED" />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link to="/dashboard/admin/users">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">User Management</h2>
            <p className="text-gray-600">Manage users, roles, and permissions.</p>
            <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
              Manage Users
            </button>
          </div>
        </Link>

        <Link to="/dashboard/admin/properties">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Property Overview</h2>
            <p className="text-gray-600">View and manage all properties in the system.</p>
            <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
              View Properties
            </button>
          </div>
        </Link>

        <Link to="/dashboard/admin/events">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Events Management</h2>
            <p className="text-gray-600">Manage events, schedules, and appointments.</p>
            <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
              Manage Events
            </button>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            <div className="rounded bg-gray-50 p-3">
              <p className="text-sm text-gray-600">New tenant registered</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <p className="text-sm text-gray-600">Maintenance request submitted</p>
              <p className="text-xs text-gray-400">Yesterday</p>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <p className="text-sm text-gray-600">Rent payment received</p>
              <p className="text-xs text-gray-400">2 days ago</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Financial Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">$24,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expenses</span>
              <span className="font-semibold">$8,320</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Net Income</span>
              <span className="font-semibold text-green-600">$16,180</span>
            </div>
            <button className="bg-primary hover:bg-opacity-90 mt-2 w-full rounded px-4 py-2 text-white transition">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
