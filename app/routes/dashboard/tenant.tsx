import React from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import type { User } from '@supabase/supabase-js';
import { createServerSupabase } from '~/lib/supabase.server';
import { prisma } from '~/lib/db';
import { redirectWithHeaders } from '~/lib/utils';
import { Role } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Home, FileText, Calendar, AlertCircle } from 'lucide-react';

// Define a type for the loader data
interface LoaderData {
  user: User | null;
  leaseCount: number;
  paymentsCount: number;
  eventsCount: number;
  maintenanceCount: number;
  recentEvents: {
    id: string;
    label: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
  propertyDetails: {
    id: string;
    label: string;
    address: string | null;
    type: string;
    postalCode: string | null;
  } | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle authentication
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  // Get user from database to verify tenant role
  const user = await prisma.user.findUnique({
    where: {
      email: data.user.email,
    },
  });

  if (!user || user.role !== Role.TENANT) {
    return redirectWithHeaders('/dashboard', headers, { status: 403 });
  }

  // Get the tenant's assigned property (assuming a tenant is assigned to one property)
  const resourceAssignment = await prisma.resourceAssignment.findFirst({
    where: {
      userId: user.id,
      role: Role.TENANT,
      isActive: true,
    },
    select: {
      resourceId: true,
    },
  });

  const resourceId = resourceAssignment?.resourceId;

  // Get property details if assigned
  let propertyDetails = null;
  if (resourceId) {
    const property = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        label: true,
        type: true,
        address: true,
      },
    });

    if (property) {
      propertyDetails = property;
    }
  }

  // Count active rental contracts for the tenant's property
  const leaseCount = resourceId
    ? await prisma.rentalContract.count({
        where: {
          resourceId,
          status: 'ACTIVE',
        },
      })
    : 0;

  // Count rent payments
  const paymentsCount = resourceId
    ? await prisma.rentPayment.count({
        where: {
          contract: {
            resourceId,
          },
        },
      })
    : 0;

  // Count maintenance requests
  const maintenanceCount = resourceId
    ? await prisma.event.count({
        where: {
          resourceId,
          type: 'MAINTENANCE_REQUEST',
        },
      })
    : 0;

  // Get events for the tenant's property
  const events = resourceId
    ? await prisma.event.findMany({
        where: {
          resourceId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          label: true,
          type: true,
          status: true,
          createdAt: true,
        },
      })
    : [];

  // Count all events
  const eventsCount = resourceId
    ? await prisma.event.count({
        where: {
          resourceId,
        },
      })
    : 0;

  // Format events
  const recentEvents = events.map(event => ({
    ...event,
    createdAt: event.createdAt.toISOString(),
  }));

  return {
    user: data.user,
    leaseCount,
    paymentsCount,
    eventsCount,
    maintenanceCount,
    recentEvents,
    propertyDetails,
  };
}

export default function TenantDashboard() {
  const {
    user,
    leaseCount,
    paymentsCount,
    eventsCount,
    maintenanceCount,
    recentEvents,
    propertyDetails,
  } = useLoaderData<LoaderData>();

  console.log(propertyDetails);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tenant Dashboard</h1>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, {user?.email ? `${user.email}` : 'Tenant'}
          </h2>
          <p className="text-muted-foreground">
            This is your tenant dashboard where you can view your lease information, make rental
            payments, and submit maintenance requests.
          </p>
        </CardContent>
      </Card>

      {/* Property Information */}
      {propertyDetails ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Residence</CardTitle>
              <Home className="text-primary h-5 w-5" />
            </div>
            <CardDescription>Your current residence information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{propertyDetails.label}</h3>
              <p className="text-muted-foreground">
                {propertyDetails.address ? (
                  <>
                    {propertyDetails.address}
                    {propertyDetails.postalCode && `, ${propertyDetails.postalCode}`}
                  </>
                ) : (
                  'No address provided'
                )}
              </p>
              <Badge>{propertyDetails.type}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Property Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have any property assigned to your account. Please contact your
              property manager.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Lease Information */}
        <Link to="/dashboard/tenant/lease" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lease</CardTitle>
                <FileText className="text-primary h-5 w-5" />
              </div>
              <CardDescription>View your lease agreement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">{leaseCount}</span>
                <span className="text-muted-foreground text-sm">
                  Active lease{leaseCount !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Payments */}
        <Link to="/dashboard/tenant/payments" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payments</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <CardDescription>View and make rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">{paymentsCount}</span>
                <span className="text-muted-foreground text-sm">Total payments</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Maintenance */}
        <Card className="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Maintenance</CardTitle>
              <AlertCircle className="text-primary h-5 w-5" />
            </div>
            <CardDescription>Submit and track maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-primary text-3xl font-bold">{maintenanceCount}</span>
              <span className="text-muted-foreground text-sm">Maintenance requests</span>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Link to="/dashboard/tenant/events" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Events</CardTitle>
                <Calendar className="text-primary h-5 w-5" />
              </div>
              <CardDescription>View all property events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">{eventsCount}</span>
                <span className="text-muted-foreground text-sm">Total events</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map(event => (
                <div
                  className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                  key={event.id}
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{event.label}</p>
                    <Badge variant={getEventStatusVariant(event.status)}>{event.status}</Badge>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <p className="text-muted-foreground text-sm">{event.type}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get badge variant based on event status
function getEventStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'PENDING':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
}
