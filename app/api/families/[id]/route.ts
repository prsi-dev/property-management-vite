import { prisma } from '~/lib/db';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: true,
        resourceApplications: true,
        rentalHistory: true,
        location: true,
        metadata: true,
        primaryResources: true,
        occupiedResources: true,
      },
    });

    if (!family) {
      return Response.json({ error: 'Family not found' }, { status: 404 });
    }

    return Response.json(family);
  } catch (error) {
    console.error('Error fetching family details:', error);
    return Response.json({ error: 'Failed to fetch family details' }, { status: 500 });
  }
}

export async function loader(request: Request, { params }: { params: { id: string } }) {
  return GET(request, { params });
}
