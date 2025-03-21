import React, { useState } from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Tag, DollarSign, MessageSquare, Users } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import {
  formatEventType,
  getEventStatusBadgeVariant,
  getEventTypeBadgeVariant,
} from '~/components/dashboard/events/events-columns';
import { formatDate, formatCurrency, getInitials } from '~/utils/utils';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

interface EventDetailData {
  id: string;
  label: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  resourceId: string;
  resource: {
    id: string;
    label: string;
    address: string | null;
    postalCode: string | null;
  };
  amount: number | null;
  notes: string | null;
  participants: Array<{
    id: string;
    role: string;
    status: string;
    user: {
      id: string;
      email: string;
      name: string;
      profileImageUrl?: string | null;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      name: string;
      profileImageUrl?: string | null;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const eventId = params.id;

    if (!eventId) {
      throw new Error('Event ID is required');
    }

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

    // If no resource is assigned, return an error
    if (!resourceAssignment) {
      throw new Error('No property is assigned to this tenant');
    }

    const resourceId = resourceAssignment.resourceId;

    // Get event details and ensure it belongs to this tenant's property
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        resourceId,
      },
      include: {
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
            postalCode: true,
          },
        },
        participants: {
          select: {
            id: true,
            role: true,
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!event) {
      // Either event doesn't exist or doesn't belong to this tenant's property
      throw new Error('Event not found or you do not have permission to view it');
    }

    // Format the event data for the frontend
    const formattedEvent = {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      participants: event.participants.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };

    return {
      event: formattedEvent,
      currentUser: user,
    };
  } catch (error) {
    console.error('Error loading event details:', error);
    return {
      event: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantEventDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { event, error } = loaderData as {
    event: EventDetailData | null;
    error?: string;
  };
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  if (error) {
    toast.error('Error loading event details:', { description: error });
  }

  // Handle submitting a comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !event) return;

    try {
      // In a real app, you would call an API endpoint to add the comment
      toast.success('Comment added successfully');
      setCommentText('');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  // If event is null, show error state
  if (!event) {
    return (
      <main className="space-y-6">
        <header className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Event Not Found</h1>
        </header>
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <Calendar className="text-muted-foreground h-12 w-12" />
              <h2 className="text-lg font-medium">Event Not Found</h2>
              <p className="text-muted-foreground text-sm">
                The event you are looking for does not exist or you do not have permission to view
                it.
              </p>
              <Button onClick={() => navigate('/dashboard/tenant/events')}>Return to Events</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{event.label}</h1>
        </div>
        <Badge variant={getEventStatusBadgeVariant(event.status)} className="text-sm">
          {event.status}
        </Badge>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section aria-labelledby="event-details">
            <Card>
              <CardHeader>
                <CardTitle id="event-details">Event Details</CardTitle>
                <CardDescription>Information about this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Event Type</h3>
                    <div className="flex items-center">
                      <Tag className="text-muted-foreground mr-2 h-4 w-4" />
                      <Badge variant={getEventTypeBadgeVariant(event.type)}>
                        {formatEventType(event.type)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Property</h3>
                    <p className="font-medium">{event.resource.label}</p>
                    <address className="text-muted-foreground text-sm not-italic">
                      {event.resource.address ? (
                        <>
                          {event.resource.address}
                          {event.resource.postalCode && `, ${event.resource.postalCode}`}
                        </>
                      ) : (
                        'No address provided'
                      )}
                    </address>
                  </div>

                  {event.amount !== null && (
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Amount</h3>
                      <div className="flex items-center">
                        <DollarSign className="text-muted-foreground mr-2 h-4 w-4" />
                        <span className="font-medium">{formatCurrency(event.amount)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Scheduled Date</h3>
                    <div className="flex items-center">
                      <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                      <time dateTime={event.startDate}>{formatDate(event.startDate)}</time>
                      {event.endDate && (
                        <time dateTime={event.endDate} className="ml-2">
                          — {formatDate(event.endDate)}
                        </time>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Created</h3>
                    <div className="flex items-center">
                      <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                      <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Updated</h3>
                    <div className="flex items-center">
                      <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                      <time dateTime={event.updatedAt}>{formatDate(event.updatedAt)}</time>
                    </div>
                  </div>
                </div>

                {event.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes</h3>
                      <div className="bg-muted rounded-md p-4 text-sm">{event.notes}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="comments-section">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle id="comments-section">Comments</CardTitle>
                  <CardDescription>
                    Discussion about this event ({event.comments.length})
                  </CardDescription>
                </div>
                <MessageSquare className="text-muted-foreground h-5 w-5" />
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="mb-2"
                  />
                  <Button type="submit" disabled={!commentText.trim()}>
                    Add Comment
                  </Button>
                </form>

                {event.comments.length > 0 ? (
                  <ul className="space-y-4">
                    {event.comments.map(comment => (
                      <li key={comment.id} className="rounded-lg border p-4">
                        <article className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage
                              src={comment.user.profileImageUrl || undefined}
                              alt={comment.user.name || 'User'}
                            />
                            <AvatarFallback>
                              {getInitials(comment.user.name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <header className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <h4 className="font-medium">{comment.user.name}</h4>
                              <time
                                dateTime={comment.createdAt}
                                className="text-muted-foreground text-xs"
                              >
                                {new Date(comment.createdAt).toLocaleString()}
                              </time>
                            </header>
                            <p className="mt-2 text-sm">{comment.content}</p>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="text-muted-foreground h-12 w-12" />
                    <h3 className="mt-2 text-lg font-medium">No Comments Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Be the first to leave a comment on this event.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="participants-section">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle id="participants-section">Participants</CardTitle>
                  <CardDescription>
                    People involved in this event ({event.participants.length})
                  </CardDescription>
                </div>
                <Users className="text-muted-foreground h-5 w-5" />
              </CardHeader>
              <CardContent>
                {event.participants.length > 0 ? (
                  <ul className="space-y-4">
                    {event.participants.map(participant => (
                      <li key={participant.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={participant.user.profileImageUrl || undefined}
                            alt={participant.user.name || 'User'}
                          />
                          <AvatarFallback>
                            {getInitials(participant.user.name || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.user.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {participant.role} • {participant.status}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="text-muted-foreground h-12 w-12" />
                    <h3 className="mt-2 text-lg font-medium">No Participants</h3>
                    <p className="text-muted-foreground text-sm">
                      No participants have been added to this event yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="actions-section">
            <Card>
              <CardHeader>
                <CardTitle id="actions-section">Actions</CardTitle>
                <CardDescription>Things you can do with this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Property Manager
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
