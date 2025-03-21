import { prisma } from '~/lib/db';
import { Role, EventType, EventStatus } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import type { ActionFunctionArgs } from 'react-router';
import { z } from 'zod';

// Define schema for event creation
const createEventSchema = z.object({
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
  notes: z.string().optional(),
});

/**
 * POST handler for creating a new event
 * Requires authentication and admin role
 */
export async function POST(request: Request) {
  try {
    // Authentication check
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

    // Parse request body
    const formData = await request.json();

    // Validate form data
    const validationResult = createEventSchema.safeParse(formData);

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

    // Create event in database
    const newEvent = await prisma.event.create({
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
          ...newEvent,
          startDate: newEvent.startDate.toISOString(),
          endDate: newEvent.endDate ? newEvent.endDate.toISOString() : null,
          createdAt: newEvent.createdAt.toISOString(),
          updatedAt: newEvent.updatedAt.toISOString(),
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating event',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * React Router action function - Calls through to the POST handler for creating events
 */
export async function action({ request }: ActionFunctionArgs) {
  return POST(request);
}
