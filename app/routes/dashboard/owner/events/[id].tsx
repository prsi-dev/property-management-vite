import { useLoaderData, type LoaderFunctionArgs, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

// Helper function to format dates
function formatDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format time with date
function formatDateTime(date: string | Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;

  // Ensure id is defined
  if (!id) {
    throw new Response('Event ID is required', { status: 400 });
  }

  const { supabase, headers } = createServerSupabase(request);
  const { data: authData } = await supabase.auth.getUser();

  // Authentication check
  if (!authData.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  // Check if user has owner rights
  const user = await prisma.user.findUnique({
    where: { email: authData.user.email },
  });

  if (!user || user.role !== Role.OWNER) {
    return redirectWithHeaders('/dashboard', headers, { status: 403 });
  }

  // Step 1: Find resources assigned to this owner via ResourceAssignment
  const assignedResources = await prisma.resourceAssignment.findMany({
    where: {
      user: {
        email: authData.user.email,
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

  // Fetch the event with basic data
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  // Check if the event is associated with one of the user's properties
  if (!resourceIds.includes(event.resourceId)) {
    return redirectWithHeaders('/dashboard/owner/events', headers, { status: 403 });
  }

  // Fetch the related resource
  const resource = await prisma.resource.findUnique({
    where: { id: event.resourceId },
    select: {
      id: true,
      label: true,
      address: true,
      type: true,
    },
  });

  // Fetch participants
  const participants = await prisma.eventAssignment.findMany({
    where: { eventId: id },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Structure the response data to match the UI expectations
  return {
    event,
    resource,
    participants,
    userId: user.id,
  };
}

function getEventStatusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' {
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

export default function OwnerEventDetails() {
  const { event, resource, participants } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold">{event.label}</h1>
          <Badge variant={getEventStatusBadgeVariant(event.status)}>{event.status}</Badge>
        </div>
        <Badge variant="outline">{event.type}</Badge>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Event Details */}
        <section aria-labelledby="event-details-heading">
          <Card>
            <CardHeader>
              <CardTitle id="event-details-heading">Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Type</dt>
                  <dd>{event.type}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Status</dt>
                  <dd>{event.status}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Start Date</dt>
                  <dd>{formatDateTime(event.startDate)}</dd>
                </div>
                {event.endDate && (
                  <div className="grid grid-cols-2 gap-2">
                    <dt className="font-medium">End Date</dt>
                    <dd>{formatDateTime(event.endDate)}</dd>
                  </div>
                )}
                {event.amount !== null && (
                  <div className="grid grid-cols-2 gap-2">
                    <dt className="font-medium">Amount</dt>
                    <dd>${event.amount.toFixed(2)}</dd>
                  </div>
                )}
                {event.notes && (
                  <div className="grid grid-cols-1 gap-2">
                    <dt className="font-medium">Notes</dt>
                    <dd className="bg-muted rounded-md p-3 whitespace-pre-wrap">{event.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </section>

        {/* Property Details */}
        <section aria-labelledby="property-details-heading">
          <Card>
            <CardHeader>
              <CardTitle id="property-details-heading">Property</CardTitle>
            </CardHeader>
            <CardContent>
              {resource ? (
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <a
                      href={`/dashboard/owner/properties/${resource.id}`}
                      className="hover:text-primary text-lg font-semibold"
                    >
                      {resource.label}
                    </a>
                    <div className="text-muted-foreground text-sm">
                      {resource.address || 'No address provided'}
                    </div>
                    <div className="text-sm">Type: {resource.type || 'Not specified'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No property assigned</div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Participants */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {participants.length === 0 ? (
                <p className="text-muted-foreground">No participants assigned</p>
              ) : (
                <ul className="space-y-2">
                  {participants.map(assignment => (
                    <li
                      key={assignment.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{assignment.user?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground text-sm">
                          {assignment.user?.email}
                        </span>
                      </div>
                      <Badge variant="outline">{assignment.user?.role}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional information */}
        <section aria-labelledby="additional-info-heading" className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle id="additional-info-heading">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Created</dt>
                  <dd>{formatDate(event.createdAt)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Last Updated</dt>
                  <dd>{formatDate(event.updatedAt)}</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </article>
  );
}
