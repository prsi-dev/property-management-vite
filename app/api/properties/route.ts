import { prisma } from '~/lib/db';
import { Role, ResourceType } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import type { ActionFunctionArgs } from 'react-router';
import { z } from 'zod';

// Define schema for property creation
const createPropertySchema = z.object({
  label: z.string().min(2, { message: 'Property name is required' }),
  type: z.enum(['BUILDING', 'UNIT', 'COMMERCIAL_SPACE', 'PARKING_SPOT', 'STORAGE', 'LAND']),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  bedroomCount: z.number().int().optional().nullable(),
  bathroomCount: z.number().optional().nullable(),
  squareFootage: z.number().optional().nullable(),
  rentAmount: z.number().optional().nullable(),
  amenities: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  images: z.array(z.string()).optional().default([]),
});

/**
 * POST handler for creating a new property
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
    const validationResult = createPropertySchema.safeParse(formData);

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

    // Create property in database
    const newProperty = await prisma.resource.create({
      data: {
        label: data.label,
        type: data.type as ResourceType,
        address: data.address,
        description: data.description,
        parentId: data.parentId,
        bedroomCount: data.bedroomCount,
        bathroomCount: data.bathroomCount,
        squareFootage: data.squareFootage,
        rentAmount: data.rentAmount,
        amenities: data.amenities,
        isActive: data.isActive,
        images: data.images,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        property: {
          ...newProperty,
          createdAt: newProperty.createdAt.toISOString(),
          updatedAt: newProperty.updatedAt.toISOString(),
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating property',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * React Router action function - Calls through to the POST handler for creating properties
 */
export async function action({ request }: ActionFunctionArgs) {
  return POST(request);
}
