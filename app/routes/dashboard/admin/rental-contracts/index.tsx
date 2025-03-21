import React, { useState } from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createServerSupabase } from '~/lib/supabase.server';
import { RentalContractsTable } from '~/components/dashboard/rental-contracts/rental-contracts-table';
import { type RentalContractData } from '~/components/dashboard/rental-contracts/rental-contracts-columns';
import { Button } from '~/components/ui/button';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { contracts: [], error: 'Unauthorized' };
    }

    // Check if user has admin rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return { contracts: [], error: 'Forbidden: Insufficient permissions' };
    }

    // Fetch all rental contracts with related property info
    const rentalContracts = await prisma.rentalContract.findMany({
      select: {
        id: true,
        contractNumber: true,
        status: true,
        startDate: true,
        endDate: true,
        isOpenEnded: true,
        baseRentAmount: true,
        securityDeposit: true,
        paymentFrequency: true,
        createdAt: true,
        updatedAt: true,
        resourceId: true,
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

export default function RentalContractsManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { contracts, counts, error } = loaderData;

  if (error) {
    toast.error('Error loading rental contracts:', { description: error });
  }

  const [selectedContract, setSelectedContract] = useState<RentalContractData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle view contract details
  function handleViewContract(_contract: RentalContractData) {
    // Action already handled by Link component in the table columns
  }

  // Handle edit contract
  function handleEditContract(contract: RentalContractData) {
    // Placeholder for editing contract
    toast.info(`Edit contract: ${contract.contractNumber}`);
    // In the future, you might open a contract edit dialog here
  }

  // Handle delete contract click
  function handleDeleteClick(contract: RentalContractData) {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  }

  // Handle delete contract confirmation
  function handleDeleteContract() {
    if (!selectedContract) return;

    // Placeholder for deleting contract
    toast.info(`Delete contract: ${selectedContract.contractNumber}`);
    setIsDeleteDialogOpen(false);
    // In the future, you would implement the API call to delete the contract
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rental Contracts Management</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus size={18} className="mr-2" />
          New Contract
        </Button>
      </div>

      {/* Contract counts by status */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Total contracts */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Total</h2>
          <p className="text-3xl font-bold">{counts?.total ?? 0}</p>
        </div>

        {/* Active */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Active</h2>
          <p className="text-3xl font-bold">{counts?.active ?? 0}</p>
        </div>

        {/* Draft */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Draft</h2>
          <p className="text-3xl font-bold">{counts?.draft ?? 0}</p>
        </div>

        {/* Expired */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Expired</h2>
          <p className="text-3xl font-bold">{counts?.expired ?? 0}</p>
        </div>

        {/* Terminated */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Terminated</h2>
          <p className="text-3xl font-bold">{counts?.terminated ?? 0}</p>
        </div>

        {/* Renewed */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Renewed</h2>
          <p className="text-3xl font-bold">{counts?.renewed ?? 0}</p>
        </div>
      </div>

      {/* Rental Contracts Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <RentalContractsTable
          contracts={contracts as RentalContractData[]}
          onViewContract={handleViewContract}
          onEditContract={handleEditContract}
          onDeleteContract={handleDeleteClick}
          searchPlaceholder="Search contracts..."
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedContract && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Rental Contract"
          message={`Are you sure you want to delete contract ${selectedContract.contractNumber}? This action cannot be undone.`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteContract}
        />
      )}
    </div>
  );
}
