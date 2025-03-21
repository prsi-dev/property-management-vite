import React from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { ResourceType, Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { PropertiesTable } from '~/components/dashboard/properties/properties-table';
import { type PropertyData } from '~/components/dashboard/properties/properties-columns';
import { redirectWithHeaders } from '~/lib/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const { supabase, headers } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return redirectWithHeaders('/auth/login', headers, { status: 401 });
    }

    // Check if user has owner rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.OWNER) {
      return redirectWithHeaders('/dashboard', headers, { status: 403 });
    }

    // Step 1: Find all resources (properties) assigned to this owner via ResourceAssignment
    const assignedResources = await prisma.resourceAssignment.findMany({
      where: {
        user: {
          email: authData.user.email,
        },
        role: Role.OWNER,
      },
      select: {
        resourceId: true,
      },
    });

    const assignedResourceIds = assignedResources.map((a: { resourceId: string }) => a.resourceId);

    // Step 2: Find all resources (properties) directly owned by this user
    const directlyOwnedProperties = await prisma.resource.findMany({
      where: {
        owners: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const directlyOwnedIds = directlyOwnedProperties.map(p => p.id);

    // Step 3: Combine both sets of IDs (without duplicates)
    const allResourceIds = [...new Set([...assignedResourceIds, ...directlyOwnedIds])];

    // Fetch properties belonging to this owner
    const properties = await prisma.resource.findMany({
      where: {
        id: {
          in: allResourceIds,
        },
      },
      select: {
        id: true,
        label: true,
        type: true,
        address: true,
        isActive: true,
        bathroomCount: true,
        bedroomCount: true,
        squareFootage: true,
        rentAmount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${properties.length} properties for owner ${user.email}`);

    // Transform the data to match PropertyData type
    const formattedProperties = properties.map(property => ({
      ...property,
      // Convert Date objects to ISO strings
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    }));

    // Count properties by type
    const buildingCount = properties.filter(p => p.type === ResourceType.BUILDING).length;
    const unitCount = properties.filter(p => p.type === ResourceType.UNIT).length;
    const commercialCount = properties.filter(p => p.type === ResourceType.COMMERCIAL_SPACE).length;
    const parkingCount = properties.filter(p => p.type === ResourceType.PARKING_SPOT).length;
    const storageCount = properties.filter(p => p.type === ResourceType.STORAGE).length;

    return {
      properties: formattedProperties,
      counts: {
        total: properties.length,
        building: buildingCount,
        unit: unitCount,
        commercial: commercialCount,
        parking: parkingCount,
        storage: storageCount,
      },
    };
  } catch (error) {
    console.error('Error loading properties:', error);
    return {
      properties: [],
      counts: {
        total: 0,
        building: 0,
        unit: 0,
        commercial: 0,
        parking: 0,
        storage: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function OwnerPropertiesManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { properties, counts, error } = loaderData;

  if (error) {
    toast.error('Error loading properties:');
  }

  // Handle view property details
  function handleViewProperty(property: PropertyData) {
    // Navigate to property details page
    window.location.href = `/dashboard/owner/properties/${property.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Properties</h1>
      </div>

      {/* Property counts by type */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Total properties */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Total</h2>
          <p className="text-3xl font-bold">{counts?.total ?? 0}</p>
        </div>

        {/* Buildings */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Buildings</h2>
          <p className="text-3xl font-bold">{counts?.building ?? 0}</p>
        </div>

        {/* Units */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Units</h2>
          <p className="text-3xl font-bold">{counts?.unit ?? 0}</p>
        </div>

        {/* Commercial Spaces */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Commercial</h2>
          <p className="text-3xl font-bold">{counts?.commercial ?? 0}</p>
        </div>

        {/* Parking Spots */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Parking</h2>
          <p className="text-3xl font-bold">{counts?.parking ?? 0}</p>
        </div>

        {/* Storage Units */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Storage</h2>
          <p className="text-3xl font-bold">{counts?.storage ?? 0}</p>
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <PropertiesTable
          properties={properties as PropertyData[]}
          onViewProperty={handleViewProperty}
          onEditProperty={handleViewProperty} // Owners don't have edit rights, redirect to view
          onDeleteProperty={handleViewProperty} // Owners don't have delete rights, redirect to view
          searchPlaceholder="Search your properties..."
        />
      </div>
    </div>
  );
}
