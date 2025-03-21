import { prisma } from '~/lib/db';
import { Role } from '@prisma/client';
import { createServerSupabase, getAdminClient } from '~/lib/supabase.server';
import type { ActionFunctionArgs } from 'react-router';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check admin permissions
    const admin = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the user to send the magic link to
    const userId = params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the origin for the redirect URL
    const origin = new URL(request.url).origin;

    // Get admin client for Supabase operations
    const supabaseAdmin = getAdminClient();

    // Find the Supabase user by email
    const { data: supabaseUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve Supabase users',
          details: listError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = supabaseUsers.users.find(u => u.email === user.email);

    if (!supabaseUser) {
      return new Response(JSON.stringify({ error: 'User not found in authentication system' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send the magic link email
    const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });

    if (magicLinkError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to generate magic link',
          details: magicLinkError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Magic link email sent successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending magic link:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while sending the magic link. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Add the action function to handle the POST request
export async function action({ request, params }: ActionFunctionArgs) {
  return POST(request, { params } as RouteParams);
}
