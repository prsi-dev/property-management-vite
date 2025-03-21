import { prisma } from '~/lib/db';
import { Role, RequestStatus } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import bcrypt from 'bcrypt';

import { seedUserToSupabase } from 'prisma/supabase-seed-utils.mjs';
import { randomUUID } from 'crypto';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

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

    if (!user || (user.role !== Role.ADMIN && user.role !== Role.PROPERTY_MANAGER)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: params.id },
    });

    if (!joinRequest) {
      return new Response(JSON.stringify({ error: 'Join request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(joinRequest), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching join request:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching the join request. Please try again.',
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

    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || (user.role !== Role.ADMIN && user.role !== Role.PROPERTY_MANAGER)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    if (!body.status || !['APPROVED', 'REJECTED'].includes(body.status)) {
      return new Response(
        JSON.stringify({ error: 'Valid status (APPROVED or REJECTED) is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: params.id },
    });

    if (!joinRequest) {
      return new Response(JSON.stringify({ error: 'Join request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (joinRequest.status !== RequestStatus.PENDING) {
      return new Response(
        JSON.stringify({
          error: `This request has already been ${joinRequest.status.toLowerCase()}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedJoinRequest = await prisma.joinRequest.update({
      where: { id: params.id },
      data: {
        status: body.status as RequestStatus,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        message:
          body.status === 'REJECTED'
            ? joinRequest.message
              ? `${joinRequest.message} | Rejection Reason: ${body.reason || 'None provided'}`
              : `Rejection Reason: ${body.reason || 'None provided'}`
            : joinRequest.message,
      },
    });

    if (body.status === 'APPROVED') {
      try {
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            id: randomUUID(),
            email: joinRequest.email,
            name: joinRequest.name,
            password: hashedPassword,
            role: joinRequest.role,
          },
        });
        await prisma.family.create({
          data: {
            id: randomUUID(),
            name: joinRequest.name,
            size: joinRequest.familySize || 0,
            creditScore: 0,
            preferredLocation: null,
            preferredRent: null,
          },
        });

        await seedUserToSupabase(newUser, temporaryPassword);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Join request approved and user account created',
            temporaryPassword,
            joinRequest: updatedJoinRequest,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error creating user account:', error);

        await prisma.joinRequest.update({
          where: { id: params.id },
          data: {
            status: RequestStatus.PENDING,
            reviewedBy: null,
            reviewedAt: null,
          },
        });

        return new Response(
          JSON.stringify({
            error: 'Failed to create user account. Join request remains pending.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Join request rejected',
        joinRequest: updatedJoinRequest,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating join request:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while updating the join request. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return GET(request, { params } as RouteParams);
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method === 'PATCH' || request.method === 'PUT') {
    return PATCH(request, { params } as RouteParams);
  }

  return new Response(JSON.stringify({ error: `Method ${request.method} not supported` }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
