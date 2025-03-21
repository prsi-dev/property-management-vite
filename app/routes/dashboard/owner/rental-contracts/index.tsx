import React from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { RentalContractsTable } from '~/components/dashboard/rental-contracts/rental-contracts-table';
import { type RentalContractData } from '~/components/dashboard/rental-contracts/rental-contracts-columns';
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

    // Get rental contracts for the user's properties
    const rentalContracts = await prisma.rentalContract.findMany({
      where: {
        resourceId: {
          in: resourceIds,
        },
      },
      include: {
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match RentalContractData type
    const formattedContracts = rentalContracts.map(contract => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      status: contract.status,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate ? contract.endDate.toISOString() : null,
      baseRentAmount: contract.baseRentAmount,
      securityDeposit: contract.securityDeposit,
      isOpenEnded: contract.isOpenEnded,
      paymentFrequency: contract.paymentFrequency,
      resourceId: contract.resourceId,
      resourceLabel: contract.resource?.label || 'Unknown Property',
      resourceAddress: contract.resource?.address || null,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }));

    // Count contracts by status
    const activeCount = rentalContracts.filter(c => c.status === 'ACTIVE').length;
    const draftCount = rentalContracts.filter(c => c.status === 'DRAFT').length;
    const expiredCount = rentalContracts.filter(c => c.status === 'EXPIRED').length;
    const terminatedCount = rentalContracts.filter(c => c.status === 'TERMINATED').length;
    const renewedCount = rentalContracts.filter(c => c.status === 'RENEWED').length;

    return {
      contracts: formattedContracts,
      counts: {
        total: rentalContracts.length,
        active: activeCount,
        draft: draftCount,
        expired: expiredCount,
        terminated: terminatedCount,
        renewed: renewedCount,
      },
    };
  } catch (error) {
    console.error('Error loading rental contracts:', error);
    return {
      contracts: [],
      counts: {
        total: 0,
        active: 0,
        draft: 0,
        expired: 0,
        terminated: 0,
        renewed: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function OwnerRentalContractsManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { contracts, counts, error } = loaderData;

  if (error) {
    toast.error('Error loading rental contracts:', { description: error });
  }

  // Handle view contract details
  function handleViewContract(contract: RentalContractData) {
    // Navigate to contract details page
    window.location.href = `/dashboard/owner/rental-contracts/${contract.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Rental Contracts</h1>
      </div>

      {/* Contract counts by status */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Total contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Total</h2>
          <p className="text-3xl font-bold">{counts?.total ?? 0}</p>
        </div>

        {/* Active contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Active</h2>
          <p className="text-3xl font-bold text-green-600">{counts?.active ?? 0}</p>
        </div>

        {/* Draft contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Draft</h2>
          <p className="text-3xl font-bold text-amber-600">{counts?.draft ?? 0}</p>
        </div>

        {/* Expired contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Expired</h2>
          <p className="text-3xl font-bold text-gray-600">{counts?.expired ?? 0}</p>
        </div>

        {/* Terminated contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Terminated</h2>
          <p className="text-3xl font-bold text-red-600">{counts?.terminated ?? 0}</p>
        </div>

        {/* Renewed contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Renewed</h2>
          <p className="text-3xl font-bold text-blue-600">{counts?.renewed ?? 0}</p>
        </div>
      </div>

      {/* Rental Contracts Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <RentalContractsTable
          contracts={contracts as RentalContractData[]}
          onViewContract={handleViewContract}
          onEditContract={handleViewContract} // Owners don't have edit rights, redirect to view
          onDeleteContract={handleViewContract} // Owners don't have delete rights, redirect to view
          searchPlaceholder="Search contracts..."
        />
      </div>
    </div>
  );
}
