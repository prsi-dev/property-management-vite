import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { prisma } from '~/lib/db';
import { createServerSupabase } from '~/lib/supabase.server';

import { UsersTable } from '~/components/dashboard/users/users-table';
import { type UserData } from '~/components/dashboard/users/columns';

import { UserDetailDialog } from '~/components/dashboard/user-detail-dialog';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import type { AddUserFormData } from '~/components/dashboard/add-user-dialog';
import { CreateUserForm } from '~/components/dashboard/users/create-user-form';
import { EditUserForm } from '~/components/dashboard/users/edit-user-form';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { users: [], error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      return { users: [], error: 'Forbidden: Insufficient permissions' };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        alternativeContact: true,
        identificationVerified: true,
        organizationId: true,

        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithOrgName = users.map(user => ({
      ...user,
      organizationName: user.organization?.name || null,
      organization: undefined,

      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    // Fetch organizations for the edit form
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      users: usersWithOrgName,
      organizations,
    };
  } catch (error) {
    console.error('Error loading users:', error);
    return {
      users: [],
      organizations: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function UsersManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { users, organizations, error } = loaderData;

  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load users', {
        description: error,
      });
    }
  }, [error]);

  function handleViewUser(user: UserData) {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  }

  function handleEditUser(user: UserData) {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }

  function handleDeleteClick(user: UserData) {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }

  function handleFormSuccess() {
    window.location.reload();
  }

  async function handleUpdateUser(userData: UserData) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      toast.success('User updated successfully');
      setIsUserDetailOpen(false);
      setIsEditDialogOpen(false);

      window.location.reload();
    } catch (error) {
      toast.error('Failed to update user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);

      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddUserClick() {
    setIsAddUserDialogOpen(true);
  }

  async function _handleAddUser(userData: AddUserFormData) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      toast.success('User created successfully');
      setIsAddUserDialogOpen(false);

      window.location.reload();
    } catch (error) {
      toast.error('Failed to create user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const totalUsers = users.length;
  const adminCount = users.filter(user => user.role === 'ADMIN').length;
  const managerCount = users.filter(user => user.role === 'PROPERTY_MANAGER').length;
  const ownerCount = users.filter(user => user.role === 'OWNER').length;
  const tenantCount = users.filter(user => user.role === 'TENANT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={handleAddUserClick}
          className="bg-primary hover:bg-primary/90 rounded px-4 py-2 text-white"
        >
          Add User
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Total Users</h2>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Admins</h2>
          <p className="text-3xl font-bold">{adminCount}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Managers</h2>
          <p className="text-3xl font-bold">{managerCount}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Owners</h2>
          <p className="text-3xl font-bold">{ownerCount}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-medium">Tenants</h2>
          <p className="text-3xl font-bold">{tenantCount}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <UsersTable
          users={users as UserData[]}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteClick}
          searchPlaceholder="Search users..."
        />
      </div>

      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          isOpen={isUserDetailOpen}
          onClose={() => setIsUserDetailOpen(false)}
          onSave={userData => {
            return handleUpdateUser(userData as unknown as UserData);
          }}
        />
      )}

      {selectedUser && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}

      <CreateUserForm
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserForm
          user={selectedUser}
          organizations={organizations || []}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
