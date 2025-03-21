import { prisma } from '~/lib/db';
import { Prisma } from '@prisma/client';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const size = searchParams.get('size');
    const hasPets = searchParams.get('hasPets');
    const minIncome = searchParams.get('minIncome');
    const minCreditScore = searchParams.get('minCreditScore');
    const verified = searchParams.get('verified');
    const longTerm = searchParams.get('longTerm');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const whereClause: Prisma.FamilyWhereInput = {
      status: 'ACTIVE', // Only include active families
    };

    // Apply filters if provided
    if (size) {
      // Parse size filter (e.g., "1-2", "3-4", "5+")
      if (size === '1-2') {
        whereClause.size = { gte: 1, lte: 2 };
      } else if (size === '3-4') {
        whereClause.size = { gte: 3, lte: 4 };
      } else if (size === '5+') {
        whereClause.size = { gte: 5 };
      }
    }

    if (hasPets !== null) {
      whereClause.hasPets = hasPets === 'true';
    }

    if (minIncome) {
      whereClause.income = { gte: parseInt(minIncome) };
    }

    if (minCreditScore) {
      whereClause.creditScore = { gte: parseInt(minCreditScore) };
    }

    if (verified === 'true') {
      whereClause.verified = true;
    }

    if (longTerm === 'true') {
      whereClause.leaseLength = { gte: 24 }; // 2+ years (24 months)
    }

    // Define valid sort fields
    const validSortFields = ['createdAt', 'name', 'size', 'income'] as const;
    const typedSortBy = validSortFields.includes(sortBy as 'size' | 'createdAt' | 'name' | 'income')
      ? sortBy
      : 'createdAt';

    // Query families with their head member and count of members
    const families = await prisma.family.findMany({
      where: whereClause,
      include: {
        members: true,
        location: true,
      },
      orderBy: {
        [typedSortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.family.count({ where: whereClause });

    return Response.json({
      families,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching families:', error);
    return Response.json({ error: 'Failed to fetch families' }, { status: 500 });
  }
}

export async function loader(request: Request) {
  return GET(request);
}
