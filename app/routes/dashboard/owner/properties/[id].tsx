import { useLoaderData, type LoaderFunctionArgs, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';

// Import our component files
import { PropertyDetailsCard } from '~/components/property/property-details-card';
import { PropertySpecificationsCard } from '~/components/property/property-specifications-card';
import { AmenitiesCard } from '~/components/property/amenities-card';
import { ParentPropertyCard } from '~/components/property/parent-property-card';
import { ChildPropertiesCard } from '~/components/property/child-properties-card';
import { RentalContractsCard } from '~/components/property/rental-contracts-card';
import { EventsCard } from '~/components/property/events-card';
import { ImageGallery } from '~/components/property/image-gallery';
import { AdditionalInfoCard } from '~/components/property/additional-info-card';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;

  // Ensure id is defined
  if (!id) {
    throw new Response('Property ID is required', { status: 400 });
  }

  const { supabase, headers } = createServerSupabase(request);
  const { data: authData } = await supabase.auth.getUser();

  // Authentication check
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

  // Step 1: Find resources assigned to this owner via ResourceAssignment
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

  // Step 2: Find resources directly owned by this user
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
  const resourceIds = [...new Set([...assignedResourceIds, ...directlyOwnedIds])];

  // Check if the requested property is owned by the user
  if (!resourceIds.includes(id)) {
    return redirectWithHeaders('/dashboard/owner/properties', headers, { status: 403 });
  }

  // Fetch property with more details
  const property = await prisma.resource.findUnique({
    where: { id },
    include: {
      children: {
        select: {
          id: true,
          label: true,
          type: true,
          isActive: true,
        },
      },
      parent: {
        select: {
          id: true,
          label: true,
          type: true,
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
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      assignments: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      events: {
        select: {
          id: true,
          label: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
        },
        orderBy: {
          startDate: 'desc',
        },
        take: 5,
      },
      rentalContracts: {
        select: {
          id: true,
          contractNumber: true,
          status: true,
          startDate: true,
          endDate: true,
          resource: {
            select: {
              assignments: {
                select: {
                  id: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!property) {
    throw new Response('Property not found', { status: 404 });
  }

  return { property };
}

export default function OwnerPropertyDetails() {
  const { property } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Get tenant information from assignments
  const tenants = property.assignments
    .filter(assignment => assignment.role === 'TENANT')
    .map(assignment => assignment.user);

  // Format dates for events
  const formattedEvents = property.events.map(event => ({
    ...event,
    startDate: event.startDate ? new Date(event.startDate).toISOString() : null,
    endDate: event.endDate ? new Date(event.endDate).toISOString() : null,
  }));

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold">{property.label}</h1>
          <Badge variant={property.isActive ? 'success' : 'secondary'}>
            {property.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </header>

      {/* Image Gallery */}
      <section aria-label="Property images">
        <ImageGallery images={property.images || []} alt={property.label} />
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Main Details */}
        <section aria-labelledby="property-details-heading">
          <PropertyDetailsCard
            id={property.id}
            label={property.label}
            type={property.type}
            address={property.address}
            description={property.description}
          />
        </section>

        {/* Property Specs */}
        <section aria-labelledby="property-specifications-heading">
          <PropertySpecificationsCard
            bedroomCount={property.bedroomCount}
            bathroomCount={property.bathroomCount}
            squareFootage={property.squareFootage}
            rentAmount={property.rentAmount}
          />
        </section>

        {/* Amenities */}
        <section aria-labelledby="amenities-heading">
          <AmenitiesCard amenities={property.amenities || []} />
        </section>

        {/* Rental Contracts */}
        <section aria-labelledby="rental-contracts-heading">
          <RentalContractsCard contracts={property.rentalContracts} userRole="OWNER" />
        </section>

        {/* Recent Events */}
        <section aria-labelledby="events-heading">
          <EventsCard events={formattedEvents} userRole="OWNER" />
        </section>

        {/* Tenants */}
        {tenants.length > 0 && (
          <section aria-labelledby="tenants-heading" className="md:col-span-2">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 id="tenants-heading" className="mb-4 text-xl font-semibold">
                Tenants
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="bg-background rounded-md border p-4">
                    <div className="font-medium">{tenant.name}</div>
                    {tenant.email && (
                      <div className="text-muted-foreground text-sm">{tenant.email}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Parent Property (if applicable) */}
        {property.parent && (
          <section aria-labelledby="parent-property-heading">
            <ParentPropertyCard parent={property.parent} />
          </section>
        )}

        {/* Child Properties (if applicable) */}
        {property.children.length > 0 && (
          <section aria-labelledby="child-properties-heading">
            <ChildPropertiesCard childProperties={property.children} />
          </section>
        )}

        {/* Additional Info */}
        <section aria-labelledby="additional-info-heading" className="md:col-span-2">
          <AdditionalInfoCard createdAt={property.createdAt} updatedAt={property.updatedAt} />
        </section>
      </div>
    </article>
  );
}
