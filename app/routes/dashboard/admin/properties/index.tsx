import React, { useState } from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { ResourceType, Role } from '@prisma/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createServerSupabase } from '~/lib/supabase.server';
import { PropertiesTable } from '~/components/dashboard/properties/properties-table';
import { type PropertyData } from '~/components/dashboard/properties/properties-columns';
import { Button } from '~/components/ui/button';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import { CreatePropertyForm } from '~/components/dashboard/properties/create-property-form';
import { EditPropertyForm } from '~/components/dashboard/properties/edit-property-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { properties: [], error: 'Unauthorized' };
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return { properties: [], error: 'Forbidden: Insufficient permissions' };
    }

    // Fetch all properties (resources in the schema)
    const properties = await prisma.resource.findMany({
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

    // Get parent properties (buildings only) for forms
    const parentProperties = await prisma.resource.findMany({
      where: {
        type: ResourceType.BUILDING,
        isActive: true,
      },
      select: {
        id: true,
        label: true,
        type: true,
      },
    });

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
      parentProperties,
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
      parentProperties: [],
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

export default function PropertiesManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { properties, counts, error } = loaderData;

  if (error) {
    toast.error('Error loading properties:');
  }

  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handle view property details
  function handleViewProperty(property: PropertyData) {
    // Navigate to property details page
    window.location.href = `/dashboard/admin/properties/${property.id}`;
  }

  // Handle edit property
  function handleEditProperty(property: PropertyData) {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  }

  // Handle delete property click
  function handleDeleteClick(property: PropertyData) {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  }

  // Handle delete property confirmation
  async function handleDeleteProperty() {
    if (!selectedProperty) return;

    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete property');
      }

      toast.success('Property deleted successfully');

      // Refresh the page to update the property list
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete property');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }

  // Handle form success (create or edit)
  function handleFormSuccess() {
    // Refresh the page to update the property list
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties Management</h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          Add Property
        </Button>
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
          onEditProperty={handleEditProperty}
          onDeleteProperty={handleDeleteClick}
          searchPlaceholder="Search properties..."
        />
      </div>

      {/* Create Property Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <CreatePropertyForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Property Form */}
      {selectedProperty && (
        <EditPropertyForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          property={selectedProperty}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedProperty && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Property"
          message={`Are you sure you want to delete ${selectedProperty.label}? This action cannot be undone.`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteProperty}
        />
      )}
    </div>
  );
}
