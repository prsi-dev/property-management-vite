import { prisma } from '~/lib/db';
import { Role, RequestStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { createServerSupabase } from '~/lib/supabase.server';
import type { ActionFunctionArgs } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import type { Prisma } from '@prisma/client';
export async function GET(request: Request) {
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

    if (!user || (user.role !== Role.ADMIN && user.role !== Role.PROPERTY_MANAGER)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const where: Prisma.JoinRequestWhereInput = {};

    if (status) {
      where.status = status as RequestStatus;
    }

    if (role) {
      where.role = role as Role;
    }

    const joinRequests = await prisma.joinRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.joinRequest.count({ where });

    return new Response(
      JSON.stringify({
        data: joinRequests,
        pagination: {
          total,
          limit,
          offset,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching join requests:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching join requests. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.role) {
      return new Response(JSON.stringify({ error: 'Name, email, and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const role = body.role.toUpperCase();
    if (!Object.values(Role).includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: 'Email is already registered. Please log in instead.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingRequest = await prisma.joinRequest.findUnique({
      where: { email: body.email },
    });

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: 'A request with this email already exists and is pending review.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        id: randomUUID(),
        email: body.email,
        name: body.name,
        role: role as Role,
        message: body.message || null,
        status: RequestStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send magic link email to the user once is approved
    const { supabase } = createServerSupabase(request);
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: body.email,
      options: {
        emailRedirectTo: `${process.env.VITE_APP_URL}/auth/callback`,
      },
    });

    if (magicLinkError) {
      console.error('Error sending magic link:', magicLinkError);
      // We don't return an error here since the join request was created successfully
      // The user can still receive admin approval and try logging in later
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Join request submitted successfully',
        requestId: joinRequest.id,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing join request:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return GET(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return POST(request);
}
