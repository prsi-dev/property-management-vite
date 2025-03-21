'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Link } from 'react-router';

// Define a type for event data
export type EventData = {
  id: string;
  label: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  resourceId: string;
  resourceLabel?: string;
  resourceAddress?: string;
  amount: number | null;
  notes: string | null;
  participantsCount: number;
  createdAt: string;
  updatedAt: string;
};

export function formatEventType(type: string) {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function getEventStatusBadgeVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
}

export function getEventTypeBadgeVariant(type: string) {
  switch (type) {
    case 'LEASE_AGREEMENT':
      return 'secondary';
    case 'RENT_PAYMENT':
      return 'info';
    case 'MAINTENANCE_REQUEST':
      return 'warning';
    case 'INSPECTION':
      return 'default';
    case 'MOVE_IN':
      return 'success';
    case 'MOVE_OUT':
      return 'destructive';
    case 'CONTRACT_RENEWAL':
      return 'secondary';
    case 'TERMINATION_NOTICE':
      return 'destructive';
    default:
      return 'default';
  }
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function getBasePath(role: string = 'ADMIN') {
  switch (role) {
    case 'OWNER':
      return '/dashboard/owner/events';
    case 'PROPERTY_MANAGER':
      return '/dashboard/manager/events';
    case 'TENANT':
      return '/dashboard/tenant/events';
    case 'SERVICE_PROVIDER':
      return '/dashboard/service/events';
    case 'ADMIN':
    default:
      return '/dashboard/admin/events';
  }
}

export const columns = (
  onView: (event: EventData) => void,
  onEdit: (event: EventData) => void,
  onDelete: (event: EventData) => void,
  userRole: string = 'ADMIN'
): ColumnDef<EventData>[] => [
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Event
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link to={`${getBasePath(userRole)}/${row.original.id}`} key={row.id}>
        <div className="font-medium">{row.getValue('label')}</div>
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return <Badge variant={getEventTypeBadgeVariant(type)}>{formatEventType(type)}</Badge>;
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant={getEventStatusBadgeVariant(status)}>{status}</Badge>;
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Start Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue('startDate'))}</div>,
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => <div>{formatDate(row.getValue('endDate'))}</div>,
  },
  {
    accessorKey: 'participantsCount',
    header: 'Participants',
    cell: ({ row }) => <div>{row.getValue('participantsCount')}</div>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number | null;
      return <div>{formatCurrency(amount)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Link to={`${getBasePath(userRole)}/${event.id}`} key={event.id}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onView(event)}
            >
              <span className="sr-only">View</span>
              <Eye size={16} />
            </Button>
          </Link>

          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(event)}>
            <span className="sr-only">Edit</span>
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive h-8 w-8 p-0"
            onClick={() => onDelete(event)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
