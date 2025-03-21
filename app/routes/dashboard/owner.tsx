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
import { Building, FileText, Calendar, TrendingUp } from 'lucide-react';

// Define a type for the loader data
interface LoaderData {
  user: User | null;
  propertiesCount: number;
  rentalContractsCount: number;
  eventsCount: number;
  recentEvents: {
    id: string;
    label: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle authentication
  const { supabase, headers } = createServerSupabase(request);
  const { data } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!data.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  // Get user from database to verify owner role
  const user = await prisma.user.findUnique({
    where: {
      email: data.user.email,
    },
  });

  if (!user || user.role !== Role.OWNER) {
    return redirectWithHeaders('/dashboard', headers, { status: 403 });
  }

  // Step 1: Find resources assigned to this owner via ResourceAssignment
  const assignedResources = await prisma.resourceAssignment.findMany({
    where: {
      user: {
        email: data.user.email,
      },
      role: Role.OWNER,
    },
    select: {
      resourceId: true,
    },
  });

  const assignedResourceIds = assignedResources.map((a: { resourceId: string }) => a.resourceId);

  // Step 2: Find resources directly owned by this user
  const directlyOwnedProperties = await prisma.resource.findMany({
    where: {
      owners: {
        some: {
          id: user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const directlyOwnedIds = directlyOwnedProperties.map(p => p.id);

  // Step 3: Combine both sets of IDs (without duplicates)
  const resourceIds = [...new Set([...assignedResourceIds, ...directlyOwnedIds])];

  // Count properties owned by this user
  const propertiesCount = resourceIds.length;

  // Get rental contracts for the user's properties
  const rentalContracts = await prisma.rentalContract.findMany({
    where: {
      resourceId: {
        in: resourceIds,
      },
    },
  });

  // Count rental contracts
  const rentalContractsCount = rentalContracts.length;

  // Get events for the user's properties
  const events = await prisma.event.findMany({
    where: {
      resourceId: {
        in: resourceIds,
      },
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
  });

  // Count events
  const eventsCount = await prisma.event.count({
    where: {
      resourceId: {
        in: resourceIds,
      },
    },
  });

  // Format events
  const recentEvents = events.map(event => ({
    ...event,
    createdAt: event.createdAt.toISOString(),
  }));

  return {
    user: data.user,
    propertiesCount,
    rentalContractsCount,
    eventsCount,
    recentEvents,
  };
}

export default function OwnerDashboard() {
  const { user, propertiesCount, rentalContractsCount, eventsCount, recentEvents } =
    useLoaderData<LoaderData>();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Property Owner Dashboard</h1>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, Property Owner {user?.email ? `(${user.email})` : ''}
          </h2>
          <p className="text-muted-foreground">
            This is your property management dashboard where you can view all of your properties,
            rental contracts, and related events.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link to="/dashboard/owner/properties" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Properties</CardTitle>
                <Building className="text-primary h-5 w-5" />
              </div>
              <CardDescription>View and manage your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">{propertiesCount}</span>
                <span className="text-muted-foreground text-sm">Total properties</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/owner/rental-contracts" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rental Contracts</CardTitle>
                <FileText className="text-primary h-5 w-5" />
              </div>
              <CardDescription>View details of your property rental contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">{rentalContractsCount}</span>
                <span className="text-muted-foreground text-sm">Active contracts</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/owner/events" className="block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Events</CardTitle>
                <Calendar className="text-primary h-5 w-5" />
              </div>
              <CardDescription>Track maintenance, payments, and other events</CardDescription>
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
                <Link to={`/dashboard/owner/events/${event.id}`} key={event.id}>
                  <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
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
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Overview</CardTitle>
            <TrendingUp className="text-primary h-5 w-5" />
          </div>
          <CardDescription>Financial reporting for your properties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Coming soon: Financial reporting for your properties
          </p>
          <div className="bg-muted rounded-md py-8 text-center">
            <p className="font-medium">Financial reports are in development</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Check back soon for detailed analytics
            </p>
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
