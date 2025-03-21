import { prisma } from '~/lib/db';
import { Role, ResourceType } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

// Define schema for property updates
const updatePropertySchema = z.object({
  label: z.string().min(2, { message: 'Property name is required' }),
  type: z.enum(['BUILDING', 'UNIT', 'COMMERCIAL_SPACE', 'PARKING_SPOT', 'STORAGE', 'LAND']),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  bedroomCount: z.number().int().optional().nullable(),
  bathroomCount: z.number().optional().nullable(),
  squareFootage: z.number().optional().nullable(),
  rentAmount: z.number().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

/**
 * GET handler for fetching a specific property
 * Requires authentication and admin role
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = params.id;

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

    // Fetch the property
    const property = await prisma.resource.findUnique({
      where: { id: propertyId },
      include: {
        parent: {
          select: {
            id: true,
            label: true,
            type: true,
          },
        },
        children: {
          select: {
            id: true,
            label: true,
            type: true,
            isActive: true,
          },
        },
        owners: {
          select: {
            id: true,
            name: true,
          },
        },
        organizationOwners: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!property) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        property: {
          ...property,
          createdAt: property.createdAt.toISOString(),
          updatedAt: property.updatedAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching property',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * PUT handler for updating a specific property
 * Requires authentication and admin role
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = params.id;

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

    if (
      !user ||
      (user.role !== Role.ADMIN && user.role !== Role.PROPERTY_MANAGER && user.role !== Role.OWNER)
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.resource.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const formData = await request.json();

    // Validate form data
    const validationResult = updatePropertySchema.safeParse(formData);

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

    // Update property in database
    const updatedProperty = await prisma.resource.update({
      where: { id: propertyId },
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
          ...updatedProperty,
          createdAt: updatedProperty.createdAt.toISOString(),
          updatedAt: updatedProperty.updatedAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating property:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating property',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE handler for removing a specific property
 * Requires authentication and admin role
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = params.id;

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

    if (
      !user ||
      (user.role !== Role.ADMIN && user.role !== Role.PROPERTY_MANAGER && user.role !== Role.OWNER)
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.resource.findUnique({
      where: { id: propertyId },
      include: {
        children: true, // Check if property has children
        events: true,
        rentalContracts: true,
      },
    });

    if (!existingProperty) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if property has children
    if (existingProperty.children.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cannot delete property with child properties. Remove child properties first.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if property has active contracts or events
    if (existingProperty.rentalContracts.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cannot delete property with active rental contracts.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (existingProperty.events.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cannot delete property with associated events.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete property from database
    await prisma.resource.delete({
      where: { id: propertyId },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Property deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error deleting property:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error deleting property',
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
