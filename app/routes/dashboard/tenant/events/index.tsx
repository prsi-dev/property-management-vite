import React from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { EventsTable } from '~/components/dashboard/events/events-table';
import { type EventData } from '~/components/dashboard/events/events-columns';
import { redirectWithHeaders } from '~/lib/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const { supabase, headers } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return redirectWithHeaders('/auth/login', headers, { status: 401 });
    }

    // Check if user has tenant rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.TENANT) {
      return redirectWithHeaders('/dashboard', headers, { status: 403 });
    }

    // Find the tenant's assigned property through ResourceAssignment
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

    // If no resource is assigned, return empty data
    if (!resourceAssignment) {
      return {
        events: [],
        counts: {
          total: 0,
          leaseAgreement: 0,
          rentPayment: 0,
          maintenance: 0,
          inspection: 0,
          moveInMoveOut: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
        },
      };
    }

    const resourceId = resourceAssignment.resourceId;

    // Get all events for the tenant's property
    const events = await prisma.event.findMany({
      where: {
        resourceId,
        // Only show certain event types to tenants
        OR: [
          { type: 'MAINTENANCE_REQUEST' },
          { type: 'INSPECTION' },
          { type: 'MOVE_IN' },
          { type: 'MOVE_OUT' },
          { type: 'LEASE_AGREEMENT' },
          { type: 'RENT_PAYMENT' },
        ],
      },
      select: {
        id: true,
        label: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        amount: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        resourceId: true,
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
          },
        },
        participants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Transform the data to match EventData type
    const formattedEvents = events.map(event => ({
      id: event.id,
      label: event.label,
      type: event.type,
      status: event.status,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
      resourceId: event.resourceId,
      resourceLabel: event.resource?.label || 'Unknown Property',
      resourceAddress: event.resource?.address || null,
      amount: event.amount,
      notes: event.notes,
      participantsCount: event.participants.length,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    // Count events by type
    const leaseAgreementCount = events.filter(e => e.type === 'LEASE_AGREEMENT').length;
    const rentPaymentCount = events.filter(e => e.type === 'RENT_PAYMENT').length;
    const maintenanceCount = events.filter(e => e.type === 'MAINTENANCE_REQUEST').length;
    const inspectionCount = events.filter(e => e.type === 'INSPECTION').length;
    const moveInMoveOutCount = events.filter(
      e => e.type === 'MOVE_IN' || e.type === 'MOVE_OUT'
    ).length;

    // Count events by status
    const pendingCount = events.filter(e => e.status === 'PENDING').length;
    const inProgressCount = events.filter(e => e.status === 'IN_PROGRESS').length;
    const completedCount = events.filter(e => e.status === 'COMPLETED').length;

    return {
      events: formattedEvents,
      counts: {
        total: events.length,
        leaseAgreement: leaseAgreementCount,
        rentPayment: rentPaymentCount,
        maintenance: maintenanceCount,
        inspection: inspectionCount,
        moveInMoveOut: moveInMoveOutCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
      },
    };
  } catch (error) {
    console.error('Error loading events:', error);
    return {
      events: [],
      counts: {
        total: 0,
        leaseAgreement: 0,
        rentPayment: 0,
        maintenance: 0,
        inspection: 0,
        moveInMoveOut: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantEventsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { events, counts, error } = loaderData;

  if (error) {
    toast.error('Error loading events:', { description: error });
  }

  // Handle view event details
  function handleViewEvent(event: EventData) {
    // Navigate to event details page
    window.location.href = `/dashboard/tenant/events/${event.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Events</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Events by status */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Pending</h2>
          <p className="text-3xl font-bold text-amber-600">{counts.pending}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">In Progress</h2>
          <p className="text-3xl font-bold text-blue-600">{counts.inProgress}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Completed</h2>
          <p className="text-3xl font-bold text-green-600">{counts.completed}</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <EventsTable
          events={events as EventData[]}
          onViewEvent={handleViewEvent}
          onEditEvent={handleViewEvent} // Tenants don't have edit rights, redirect to view
          onDeleteEvent={handleViewEvent} // Tenants don't have delete rights, redirect to view
          searchPlaceholder="Search events..."
          userRole="TENANT"
        />
      </div>
    </div>
  );
}
