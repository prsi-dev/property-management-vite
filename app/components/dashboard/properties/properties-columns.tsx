'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ResourceType } from '@prisma/client';
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Link } from 'react-router';

export type PropertyData = {
  id: string;
  label: string;
  type: ResourceType;
  address?: string | null;
  isActive: boolean;
  bathroomCount?: number | null;
  bedroomCount?: number | null;
  squareFootage?: number | null;
  rentAmount?: number | null;
  createdAt: string;
  updatedAt: string;
};

export function formatResourceType(type: ResourceType) {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function getPropertyTypeBadgeVariant(type: ResourceType) {
  switch (type) {
    case 'BUILDING':
      return 'default';
    case 'UNIT':
      return 'info';
    case 'COMMERCIAL_SPACE':
      return 'secondary';
    case 'PARKING_SPOT':
      return 'warning';
    case 'STORAGE':
      return 'destructive';
    case 'LAND':
      return 'success';
    default:
      return 'default';
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const columns = (
  onView: (property: PropertyData) => void,
  onEdit: (property: PropertyData) => void,
  onDelete: (property: PropertyData) => void
): ColumnDef<PropertyData>[] => [
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link to={`/dashboard/admin/properties/${row.original.id}`} key={row.id}>
        <div className="font-medium">{row.getValue('label')}</div>
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as ResourceType;
      return <Badge variant={getPropertyTypeBadgeVariant(type)}>{formatResourceType(type)}</Badge>;
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => <div>{row.getValue('address') || '—'}</div>,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'success' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'bedroomCount',
    header: 'Beds',
    cell: ({ row }) => <div>{row.getValue('bedroomCount') || '—'}</div>,
  },
  {
    accessorKey: 'bathroomCount',
    header: 'Baths',
    cell: ({ row }) => <div>{row.getValue('bathroomCount') || '—'}</div>,
  },
  {
    accessorKey: 'squareFootage',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Sq. Ft.
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const squareFootage = row.getValue('squareFootage') as number | null;
      return <div>{squareFootage ? `${squareFootage} sq. ft.` : '—'}</div>;
    },
  },
  {
    accessorKey: 'rentAmount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Rent
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rentAmount = row.getValue('rentAmount') as number | null;
      return <div>{formatCurrency(rentAmount)}</div>;
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const property = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Link to={`/dashboard/admin/properties/${property.id}`} key={property.id}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onView(property)}
            >
              <span className="sr-only">View</span>
              <Eye size={16} />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(property)}
          >
            <span className="sr-only">Edit</span>
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive h-8 w-8 p-0"
            onClick={() => onDelete(property)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
