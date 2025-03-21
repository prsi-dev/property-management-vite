import { useState } from 'react';
import { useLoaderData, type LoaderFunctionArgs, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { ResourceType } from '@prisma/client';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import { EditPropertyForm } from '~/components/dashboard/properties/edit-property-form';

// Import our component files
import { PropertyDetailsCard } from '~/components/property/property-details-card';
import { PropertySpecificationsCard } from '~/components/property/property-specifications-card';
import { AmenitiesCard } from '~/components/property/amenities-card';
import { ParentPropertyCard } from '~/components/property/parent-property-card';
import { ChildPropertiesCard } from '~/components/property/child-properties-card';
import { OwnersCard } from '~/components/property/owners-card';
import { TagsCard } from '~/components/property/tags-card';
import { ApplicationsCard } from '~/components/property/applications-card';
import { RentalContractsCard } from '~/components/property/rental-contracts-card';
import { EventsCard } from '~/components/property/events-card';
import { ImageGallery } from '~/components/property/image-gallery';
import { AdditionalInfoCard } from '~/components/property/additional-info-card';

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  // Fetch all potential parent properties for the edit form
  const parentProperties = await prisma.resource.findMany({
    where: {
      type: ResourceType.BUILDING,
      isActive: true,
      id: { not: id }, // Exclude the current property from being its own parent
    },
    select: {
      id: true,
      label: true,
      type: true,
    },
  });

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
        },
      },
      events: {
        select: {
          id: true,
          label: true,
          type: true,
        },
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
      applications: {
        select: {
          id: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  if (!property) {
    throw new Response('Property not found', { status: 404 });
  }

  return { property, parentProperties };
}

export default function PropertyDetails() {
  const { property, parentProperties: _parentProperties } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Format property data for the edit form
  const formattedProperty = {
    ...property,
    createdAt: property.createdAt.toString(),
    updatedAt: property.updatedAt.toString(),
  };

  // Handle edit property
  function handleEditProperty() {
    setIsEditDialogOpen(true);
  }

  // Handle delete property
  function handleDeleteClick() {
    setIsDeleteDialogOpen(true);
  }

  // Handle delete confirmation
  async function handleDeleteProperty() {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete property');
      }

      toast.success('Property deleted successfully');

      // Navigate back to the properties list
      navigate('/dashboard/admin/properties');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete property');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }

  // Handle form success (create or edit)
  function handleFormSuccess() {
    // Refresh the page to update the property data
    window.location.reload();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{property.label}</h1>
          <Badge variant={property.isActive ? 'success' : 'secondary'}>
            {property.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEditProperty}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={property.images} alt={property.label} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Main Details */}
        <PropertyDetailsCard
          id={property.id}
          label={property.label}
          type={property.type}
          address={property.address}
          description={property.description}
        />

        {/* Property Specs */}
        <PropertySpecificationsCard
          bedroomCount={property.bedroomCount}
          bathroomCount={property.bathroomCount}
          squareFootage={property.squareFootage}
          rentAmount={property.rentAmount}
        />

        {/* Amenities */}
        <AmenitiesCard amenities={property.amenities} />

        {/* Parent Property */}
        <ParentPropertyCard parent={property.parent} />

        {/* Child Properties */}
        <ChildPropertiesCard childProperties={property.children} />

        {/* Owners */}
        <OwnersCard owners={property.owners} organizationOwners={property.organizationOwners} />

        {/* Tags */}
        <TagsCard tags={property.tags} />

        {/* Applications */}
        <ApplicationsCard applications={property.applications} />

        {/* Rental Contracts */}
        <RentalContractsCard contracts={property.rentalContracts} />

        {/* Events */}
        <EventsCard events={property.events} />

        {/* Additional Information */}
        <AdditionalInfoCard
          createdAt={property.createdAt}
          updatedAt={property.updatedAt}
          metadataGroupId={property.metadataGroupId}
        />
      </div>

      {/* Edit Property Form */}
      <EditPropertyForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        property={formattedProperty}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Property"
        message={`Are you sure you want to delete ${property.label}? This action cannot be undone.`}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProperty}
      />
    </div>
  );
}
