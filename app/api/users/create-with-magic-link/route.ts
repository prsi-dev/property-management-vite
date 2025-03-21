import { prisma } from '~/lib/db';
import { Role } from '@prisma/client';
import { createServerSupabase, getAdminClient } from '~/lib/supabase.server';
import { z } from 'zod';
import type { ActionFunctionArgs } from 'react-router';

export async function POST(request: Request) {
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

    const body = await request.json();

    const userSchema = z.object({
      email: z.string().email('Invalid email format'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'OWNER', 'TENANT', 'SERVICE_PROVIDER']),
      phoneNumber: z.string().optional().nullable(),
      alternativeContact: z.string().optional().nullable(),
      identificationVerified: z.boolean().optional().default(false),
      organizationId: z.string().optional().nullable(),
      useMagicLink: z.boolean().optional().default(false),
    });

    const validationResult = userSchema.safeParse(body);
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

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create user in Prisma
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role as Role,
        phoneNumber: body.phoneNumber,
        alternativeContact: body.alternativeContact,
        identificationVerified: body.identificationVerified,
        organizationId: body.organizationId,
        password: body.password, // Temporary password
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get the origin for the redirect URL
    const origin = new URL(request.url).origin;

    // Get admin client for Supabase operations
    const supabaseAdmin = getAdminClient();

    // Create the user in Supabase with a temporary password
    const { error: supabaseError, data: _supabaseUser } = await supabaseAdmin.auth.admin.createUser(
      {
        email: body.email,
        password: body.password,
        email_confirm: true,
      }
    );

    if (supabaseError) {
      // Rollback - delete the user in Prisma
      await prisma.user.delete({
        where: { id: newUser.id },
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to create auth account',
          details: supabaseError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send the magic link
    const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
      email: body.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/dashboard`,
      },
    });

    if (magicLinkError) {
      return new Response(
        JSON.stringify({
          error: 'User created but failed to send magic link',
          details: magicLinkError.message,
          user: newUser,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'User created and magic link sent successfully',
        user: newUser,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating user with magic link:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while creating the user. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Add the action function to handle the POST request
export async function action({ request }: ActionFunctionArgs) {
  return POST(request);
}
