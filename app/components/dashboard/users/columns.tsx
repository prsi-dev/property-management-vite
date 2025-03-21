'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Role } from '@prisma/client';
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Link } from 'react-router';

export type UserData = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  identificationVerified?: boolean;
  organizationId?: string | null;
  organizationName?: string | null;
};

export function formatRoleName(role: Role) {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'PROPERTY_MANAGER':
      return 'info';
    case 'OWNER':
      return 'secondary';
    case 'TENANT':
      return 'success';
    case 'SERVICE_PROVIDER':
      return 'warning';
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

export const columns = (
  onView: (user: UserData) => void,
  onEdit: (user: UserData) => void,
  onDelete: (user: UserData) => void
): ColumnDef<UserData>[] => [
  {
    accessorKey: 'name',
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
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      return <Badge variant={getRoleBadgeVariant(role)}>{formatRoleName(role)}</Badge>;
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'organizationName',
    header: 'Organization',
    cell: ({ row }) => <div>{row.getValue('organizationName') || '—'}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="pl-0 font-medium"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue('createdAt'))}</div>,
  },
  {
    accessorKey: 'identificationVerified',
    header: 'Status',
    cell: ({ row }) => {
      const isVerified = row.getValue('identificationVerified') as boolean;
      return (
        <Badge variant={isVerified ? 'success' : 'warning'}>
          {isVerified ? 'Verified' : 'Unverified'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Link to={`/dashboard/admin/users/${user.id}`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">View</span>
              <Eye size={16} />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(user)}>
            <span className="sr-only">Edit</span>
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive h-8 w-8 p-0"
            onClick={() => onDelete(user)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
