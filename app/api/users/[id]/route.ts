import { prisma } from '~/lib/db';
import { Role } from '@prisma/client';
import { createServerSupabase, getAdminClient } from '~/lib/supabase.server';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = params.id;

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        alternativeContact: true,
        identificationVerified: true,
        organizationId: true,
      },
    });

    if (!foundUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(foundUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching the user. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = params.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const userUpdateSchema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'OWNER', 'TENANT', 'SERVICE_PROVIDER']).optional(),
      phoneNumber: z.string().optional().nullable(),
      alternativeContact: z.string().optional().nullable(),
      identificationVerified: z.boolean().optional(),
      organizationId: z.string().optional().nullable(),
    });

    const validationResult = userUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return new Response(JSON.stringify({ error: 'Email already in use' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = getAdminClient();

      const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          email: body.email,
        }
      );

      if (supabaseError) {
        return new Response(
          JSON.stringify({
            error: 'Failed to update email in auth system',
            details: supabaseError.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
        role: body.role as Role | undefined,
        phoneNumber: body.phoneNumber,
        alternativeContact: body.alternativeContact,
        identificationVerified: body.identificationVerified,
        organizationId: body.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        alternativeContact: true,
        identificationVerified: true,
        organizationId: true,
      },
    });

    return new Response(
      JSON.stringify({
        message: 'User updated successfully',
        user: updatedUser,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating user:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while updating the user. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = params.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const supabaseAdmin = getAdminClient();

      const { data: supabaseUsers, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (error) {
        throw error;
      }

      const supabaseUser = supabaseUsers.users.find(user => user.email === existingUser.email);

      if (supabaseUser) {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      }
    } catch (supabaseError) {
      console.error('Error deleting Supabase user:', supabaseError);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(
      JSON.stringify({
        message: 'User deleted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting user:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while deleting the user. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return GET(request, { params } as RouteParams);
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method === 'DELETE') {
    return DELETE(request, { params } as RouteParams);
  } else if (request.method === 'PATCH' || request.method === 'PUT') {
    return PATCH(request, { params } as RouteParams);
  }

  return new Response(JSON.stringify({ error: `Method ${request.method} not supported` }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
