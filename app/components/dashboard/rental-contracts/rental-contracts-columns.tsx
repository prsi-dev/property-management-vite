'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Link } from 'react-router';

// Define a type for rental contract data
export type RentalContractData = {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate: string | null;
  baseRentAmount: number;
  securityDeposit: number;
  isOpenEnded: boolean;
  paymentFrequency: string;
  resourceId: string;
  resourceLabel?: string;
  resourceAddress?: string;
  createdAt: string;
  updatedAt: string;
};

// Helper function to format payment frequency
export function formatPaymentFrequency(frequency: string) {
  return frequency
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Helper function for contract status badge styling
export function getContractStatusBadgeVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'secondary';
    case 'EXPIRED':
      return 'default';
    case 'TERMINATED':
      return 'destructive';
    case 'RENEWED':
      return 'info';
    default:
      return 'default';
  }
}

// Format date for display
export function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format currency for display
export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Column definitions for the rental contracts table
export const columns = (
  onView: (contract: RentalContractData) => void,
  onEdit: (contract: RentalContractData) => void,
  onDelete: (contract: RentalContractData) => void
): ColumnDef<RentalContractData>[] => [
  {
    accessorKey: 'contractNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Contract #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link to={`/dashboard/admin/rental-contracts/${row.original.id}`} key={row.id}>
        <div className="font-medium">{row.getValue('contractNumber')}</div>
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant={getContractStatusBadgeVariant(status)}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'resourceLabel',
    header: 'Property',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('resourceLabel') || '—'}</div>
        <div className="text-muted-foreground text-xs">{row.original.resourceAddress || ''}</div>
      </div>
    ),
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => <div>{formatDate(row.getValue('startDate'))}</div>,
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => {
      const endDate = row.getValue('endDate') as string | null;
      const isOpenEnded = row.original.isOpenEnded;
      return <div>{isOpenEnded ? 'Open-ended' : formatDate(endDate)}</div>;
    },
  },
  {
    accessorKey: 'baseRentAmount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Rent Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rentAmount = row.getValue('baseRentAmount') as number;
      return <div>{formatCurrency(rentAmount)}</div>;
    },
  },
  {
    accessorKey: 'paymentFrequency',
    header: 'Frequency',
    cell: ({ row }) => {
      const frequency = row.getValue('paymentFrequency') as string;
      return <div>{formatPaymentFrequency(frequency)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contract = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Link to={`/dashboard/admin/rental-contracts/${contract.id}`} key={contract.id}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onView(contract)}
            >
              <span className="sr-only">View</span>
              <Eye size={16} />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(contract)}
          >
            <span className="sr-only">Edit</span>
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive h-8 w-8 p-0"
            onClick={() => onDelete(contract)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
