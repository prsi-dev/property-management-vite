import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { prisma } from '~/lib/db';
import { ArrowLeft, Edit, Trash, Calendar, Clock, DollarSign, MapPin, Users } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { format } from 'date-fns';
import { Role } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import { EditEventForm } from '~/components/dashboard/events/edit-event-form';
import { toast } from 'sonner';

// Define proper types for the event data
type EventParticipant = {
  id: string;
  role?: string;
  status?: string;
  notes?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
  };
};

type Resource = {
  id: string;
  label: string;
  address?: string | null;
  description?: string | null;
  owners?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  }[];
};

type EventData = {
  id: string;
  label: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  amount: number | null;
  notes: string | null;
  resourceId: string;
  resource?: Resource;
  participants?: EventParticipant[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  metadataGroupId: string | null;
  participantsCount?: number;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const eventId = params.id;
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new Error('Forbidden: Insufficient permissions');
    }

    // Fetch all resources (properties) for dropdown in the edit form
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        label: true,
        type: true,
        address: true,
        description: true,
        owners: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        label: 'asc',
      },
    });

    // Fetch event with related data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        resource: {
          include: {
            owners: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    return {
      event: {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate ? event.endDate.toISOString() : null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      } as EventData,
      properties: resources,
    };
  } catch (error) {
    console.error('Error loading event details:', error);
    return {
      event: null,
      properties: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

type LoaderData = {
  event: EventData | null;
  properties: { id: string; label: string }[];
  error?: string;
};

export default function EventDetail() {
  const loaderData = useLoaderData<typeof loader>() as LoaderData;
  const { event, properties, error } = loaderData;
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (error) {
    toast.error('Error loading event:', { description: error });
    return (
      <div className="mx-auto max-w-7xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p className="mb-6 text-red-500">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold">Event Not Found</h1>
        <p className="mb-6">
          The event you&apos;re looking for doesn&apos;t exist or may have been deleted.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Format the event status for display
  function formatEventStatus(status: string) {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get badge variant based on event status
  function getEventStatusBadgeVariant(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  // Format the event type for display
  function formatEventType(type: string) {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get badge variant based on event type
  function getEventTypeBadgeVariant(type: string) {
    switch (type) {
      case 'LEASE_AGREEMENT':
        return 'default';
      case 'RENT_PAYMENT':
        return 'success';
      case 'MAINTENANCE_REQUEST':
        return 'warning';
      case 'INSPECTION':
        return 'secondary';
      case 'MOVE_IN':
      case 'MOVE_OUT':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  // Format currency
  function formatCurrency(amount: number | null) {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Handle event deletion
  async function handleDeleteEvent() {
    if (!event) return;

    try {
      // Call the API to delete the event
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');

      // Navigate back to events list
      navigate('/dashboard/admin/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsDeleteDialogOpen(false);
    }
  }

  // Handle edit button click
  function handleEditClick() {
    setIsEditDialogOpen(true);
  }

  // Handle close edit dialog
  function handleCloseEditDialog() {
    setIsEditDialogOpen(false);
  }
  console.log(event);
  return (
    <div className="space-y-6 p-6">
      {/* Event Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{event.label}</h1>
            <Badge variant={getEventStatusBadgeVariant(event.status as string)}>
              {formatEventStatus(event.status as string)}
            </Badge>
            <Badge variant={getEventTypeBadgeVariant(event.type as string)}>
              {formatEventType(event.type as string)}
            </Badge>
          </div>
          {event.resource && (
            <p className="mt-1 flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              {event.resource.label}
              {event.resource.address && ` - ${event.resource.address}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Event Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="participants">
            Participants ({event.participants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
                <CardDescription>Detailed information about this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Event Type */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <p>{formatEventType(event.type as string)}</p>
                  </div>

                  {/* Event Status */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p>{formatEventStatus(event.status as string)}</p>
                  </div>

                  {/* Start Date */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date & Time</h3>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                      <Clock className="ml-2 h-4 w-4 text-gray-400" />
                      {format(new Date(event.startDate), 'h:mm a')}
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">End Date & Time</h3>
                    {event.endDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {format(new Date(event.endDate), 'MMM d, yyyy')}
                        <Clock className="ml-2 h-4 w-4 text-gray-400" />
                        {format(new Date(event.endDate), 'h:mm a')}
                      </div>
                    ) : (
                      <p>—</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                    <div className="flex items-center gap-1">
                      {event.amount !== null && <DollarSign className="h-4 w-4 text-gray-400" />}
                      {formatCurrency(event.amount)}
                    </div>
                  </div>

                  {/* Number of Participants */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Participants</h3>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      {event.participants?.length || 0}
                    </div>
                  </div>

                  {/* Created At */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p>{format(new Date(event.createdAt), 'MMM d, yyyy, h:mm a')}</p>
                  </div>

                  {/* Updated At */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p>{format(new Date(event.updatedAt), 'MMM d, yyyy, h:mm a')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            {event.resource && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>Details about the associated property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Property Name</h3>
                    <p>{event.resource.label}</p>
                  </div>
                  {event.resource.address && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p>{event.resource.address}</p>
                    </div>
                  )}
                  {event.resource.owners && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Owner</h3>
                      <div className="space-y-2">
                        {event.resource.owners.map(owner => (
                          <div key={owner.id}>
                            <p>{owner.name}</p>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                            {owner.phoneNumber && (
                              <p className="text-sm text-gray-500">{owner.phoneNumber}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Event Participants</CardTitle>
              <CardDescription>People involved in this event</CardDescription>
            </CardHeader>
            <CardContent>
              {!event.participants || event.participants.length === 0 ? (
                <p className="text-center text-gray-500">No participants for this event.</p>
              ) : (
                <ul className="divide-y">
                  {event.participants.map(participant => (
                    <li key={participant.id} className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {participant.user.avatar ? (
                            <img
                              src={participant.user.avatar}
                              alt={`${participant.user.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                              {participant.user.name ? participant.user.name.charAt(0) : 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{participant.user.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-500">{participant.user.email}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <Badge>
                            {participant.role
                              ?.replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <Badge
                            variant={participant.status === 'CONFIRMED' ? 'success' : 'warning'}
                          >
                            {participant.status
                              ?.replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                      {participant.notes && (
                        <div className="mt-2 pl-14">
                          <p className="text-sm text-gray-600">{participant.notes}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Event Notes</CardTitle>
              <CardDescription>Additional information about this event</CardDescription>
            </CardHeader>
            <CardContent>
              {event.notes ? (
                <div className="prose max-w-none">
                  <p>{event.notes}</p>
                </div>
              ) : (
                <p className="text-center text-gray-500">No notes for this event.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Files attached to this event</CardDescription>
            </CardHeader>
            <CardContent>
              {event.attachments && event.attachments.length > 0 ? (
                <ul className="divide-y">
                  {/* Map through attachments here if implemented */}
                  <li className="py-3">Example attachment would go here</li>
                </ul>
              ) : (
                <p className="text-center text-gray-500">No attachments for this event.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${event.label}"? This action cannot be undone.`}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteEvent}
      />

      {/* Edit Event Dialog */}
      {event && (
        <EditEventForm
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          event={{
            ...event,
            participantsCount: event.participants?.length || 0,
          }}
          properties={properties || []}
        />
      )}
    </div>
  );
}
