import { prisma } from '~/lib/db';
import { Role } from '@prisma/client';
import { createServerSupabase, getAdminClient } from '~/lib/supabase.server';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

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

    if (!user || user.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.user.count({ where });

    return new Response(
      JSON.stringify({
        data: users,
        pagination: {
          total,
          limit,
          offset,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching users:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching users. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.name || !body.role || !body.password) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating user in Prisma with data:', {
      email: body.email,
      name: body.name,
      role: body.role,
      // Don't log password
    });

    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role as Role,
        phoneNumber: body.phoneNumber,
        organizationId: body.organizationId,
        password: body.password,
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

    console.log('Prisma user created successfully:', newUser.id);
    console.log('Getting Supabase admin client');

    const supabaseAdmin = getAdminClient();

    console.log('Creating user in Supabase auth with email:', body.email);

    const { error: supabaseError, data: supabaseData } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    console.log(
      'Supabase auth response:',
      supabaseError ? 'Error' : 'Success',
      supabaseError ? { message: supabaseError.message } : { userId: supabaseData?.user?.id }
    );

    if (supabaseError) {
      console.error('Supabase error details:', supabaseError);

      console.log('Rolling back - deleting Prisma user with ID:', newUser.id);
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

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        user: newUser,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating user:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while creating the user. Please try again.',
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
