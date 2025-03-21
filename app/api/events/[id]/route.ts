import { prisma } from '~/lib/db';
import { Role, EventType, EventStatus } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

// Define schema for event updates
const updateEventSchema = z.object({
  label: z.string().min(2, { message: 'Event label is required' }),
  type: z.enum([
    'LEASE_AGREEMENT',
    'RENT_PAYMENT',
    'MAINTENANCE_REQUEST',
    'INSPECTION',
    'MOVE_IN',
    'MOVE_OUT',
    'CONTRACT_RENEWAL',
    'TERMINATION_NOTICE',
  ]),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  resourceId: z.string({ required_error: 'Resource ID is required' }),
  startDate: z.string().datetime({ message: 'Valid start date is required' }),
  endDate: z.string().datetime().optional().nullable(),
  amount: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * GET handler for fetching a specific event
 * Requires authentication and admin role
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;

    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        resource: true,
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
      return new Response(JSON.stringify({ success: false, error: 'Event not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          ...event,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate ? event.endDate.toISOString() : null,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching event',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * PUT handler for updating a specific event
 * Requires authentication and admin role
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;

    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return new Response(JSON.stringify({ success: false, error: 'Event not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const formData = await request.json();

    // Validate form data
    const validationResult = updateEventSchema.safeParse(formData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation error',
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = validationResult.data;

    // Update event in database
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        label: data.label,
        type: data.type as EventType,
        status: data.status as EventStatus,
        resourceId: data.resourceId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        amount: data.amount,
        notes: data.notes || null,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          ...updatedEvent,
          startDate: updatedEvent.startDate.toISOString(),
          endDate: updatedEvent.endDate ? updatedEvent.endDate.toISOString() : null,
          createdAt: updatedEvent.createdAt.toISOString(),
          updatedAt: updatedEvent.updatedAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating event',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE handler for removing a specific event
 * Requires authentication and admin role
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;

    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return new Response(JSON.stringify({ success: false, error: 'Event not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete event from database
    await prisma.event.delete({
      where: { id: eventId },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error deleting event',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
/**
 * React Router loader function - Calls through to the GET handler
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  return GET(request, { params: { id: params.id as string } });
}

/**
 * React Router action function - Calls through to the appropriate handler based on method
 */
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method === 'PUT' || request.method === 'PATCH') {
    return PUT(request, { params: { id: params.id as string } });
  } else if (request.method === 'DELETE') {
    return DELETE(request, { params: { id: params.id as string } });
  }

  return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
