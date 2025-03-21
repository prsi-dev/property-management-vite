import React, { useState } from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData, useRevalidator } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createServerSupabase } from '~/lib/supabase.server';
import { EventsTable } from '~/components/dashboard/events/events-table';
import { type EventData } from '~/components/dashboard/events/events-columns';
import { Button } from '~/components/ui/button';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import { CreateEventForm } from '~/components/dashboard/events/create-event-form';
import { EditEventForm } from '~/components/dashboard/events/edit-event-form';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { events: [], error: 'Unauthorized' };
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return { events: [], error: 'Forbidden: Insufficient permissions' };
    }

    // Fetch all resources (properties) for the dropdown
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        label: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        label: 'asc',
      },
    });

    // Fetch all events with related resource info
    const events = await prisma.event.findMany({
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
      properties: resources,
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
      properties: [],
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

export default function EventsManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { events, properties, counts, error } = loaderData;
  const revalidator = useRevalidator();

  if (error) {
    toast.error('Error loading events:', { description: error });
  }

  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to refresh data
  const refreshData = () => {
    revalidator.revalidate();
  };

  // Handle view event details
  function handleViewEvent(_event: EventData) {
    // Action already handled by Link component in the table columns
  }

  // Handle edit event
  function handleEditEvent(event: EventData) {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  }

  // Handle edit dialog close
  function handleCloseEditDialog() {
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  }

  // Handle delete event click
  function handleDeleteClick(event: EventData) {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  }

  // Handle delete event confirmation
  async function handleDeleteEvent() {
    if (!selectedEvent) return;

    try {
      // Call the API to delete the event
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');

      // Close the dialog
      setIsDeleteDialogOpen(false);

      // Refresh data instead of reloading the page
      refreshData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsDeleteDialogOpen(false);
    }
  }

  // Handle opening create dialog
  function handleAddEventClick() {
    setIsCreateDialogOpen(true);
  }

  // Handle closing create dialog
  function handleCloseCreateDialog() {
    setIsCreateDialogOpen(false);
  }

  // Handle form success
  function handleFormSuccess() {
    refreshData();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleAddEventClick}>
          <Plus size={18} className="mr-2" />
          Add Event
        </Button>
      </div>

      {/* Event counts cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Total events */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Total Events</h2>
          <p className="text-3xl font-bold">{counts?.total ?? 0}</p>
        </div>

        {/* Pending events */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Pending</h2>
          <p className="text-3xl font-bold">{counts?.pending ?? 0}</p>
        </div>

        {/* In Progress events */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">In Progress</h2>
          <p className="text-3xl font-bold">{counts?.inProgress ?? 0}</p>
        </div>

        {/* Completed events */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Completed</h2>
          <p className="text-3xl font-bold">{counts?.completed ?? 0}</p>
        </div>
      </div>

      {/* Event type counts */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {/* Lease Agreement */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Lease Agreements</h2>
          <p className="text-3xl font-bold">{counts?.leaseAgreement ?? 0}</p>
        </div>

        {/* Rent Payment */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Rent Payments</h2>
          <p className="text-3xl font-bold">{counts?.rentPayment ?? 0}</p>
        </div>

        {/* Maintenance */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Maintenance</h2>
          <p className="text-3xl font-bold">{counts?.maintenance ?? 0}</p>
        </div>

        {/* Inspection */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Inspections</h2>
          <p className="text-3xl font-bold">{counts?.inspection ?? 0}</p>
        </div>

        {/* Move In/Out */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Move In/Out</h2>
          <p className="text-3xl font-bold">{counts?.moveInMoveOut ?? 0}</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <EventsTable
          events={events as EventData[]}
          onViewEvent={handleViewEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteClick}
          searchPlaceholder="Search events..."
          userRole="ADMIN"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedEvent && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Event"
          message={`Are you sure you want to delete the event "${selectedEvent.label}"? This action cannot be undone.`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteEvent}
        />
      )}

      {/* Create Event Dialog */}
      <CreateEventForm
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        properties={properties || []}
        onSuccess={handleFormSuccess}
      />

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <EditEventForm
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          event={selectedEvent}
          properties={properties || []}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
