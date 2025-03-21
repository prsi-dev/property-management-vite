import { useState } from 'react';
import { useLoaderData, type LoaderFunctionArgs, useNavigate, Link } from 'react-router';
import { prisma } from '~/lib/db';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ArrowLeft, Edit, Trash, Check, X, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@prisma/client';
import { DeleteConfirmationDialog } from '~/components/dashboard/delete-confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { EditUserForm } from '~/components/dashboard/users/edit-user-form';

import { UserDetailsCard } from '~/components/user/user-details-card';
import { EmploymentDetailsCard } from '~/components/user/employment-details-card';
import { IdentificationCard } from '~/components/user/identification-card';
import { OrganizationCard } from '~/components/user/organization-card';
import { UserPropertiesCard } from '~/components/user/user-properties-card';
import { UserApplicationsCard } from '~/components/user/user-applications-card';
import { AdditionalInfoCard } from '~/components/property/additional-info-card';
import { TenantDetailsCard } from '~/components/user/tenant-details-card';
import { RentPaymentHistory } from '~/components/user/rent-payment-history';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FileText, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { UserAssignmentsCard } from '~/components/dashboard/users/user-assignments-card';

type TenantData = {
  moveInDate: string;
  leaseEndDate: string;
  currentLeaseLength: number;
  occupants: number;
  rentAmount: number;
  paymentHistory: string;
  leaseRenewalStatus: string;
  specialRequirements: string | null;
  rentalHistory: number;
};

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'late' | 'missed' | 'pending' | 'not-due';
  lateBy?: number | null;
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
          contactEmail: true,
          contactPhone: true,
          website: true,
        },
      },
      ownedResources: {
        select: {
          id: true,
          label: true,
          type: true,
          isActive: true,
        },
      },
      resourceAssignments: {
        select: {
          id: true,
          resourceId: true,
          resource: {
            select: {
              label: true,
              type: true,
              isActive: true,
              owners: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      applicationForms: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          resourceId: true,
          resource: {
            select: {
              label: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const simulatedTenantData = user.role === Role.TENANT ? generateTenantData(user.id) : null;
  const simulatedPaymentRecords =
    user.role === Role.TENANT ? generatePaymentHistory(user.id) : null;

  return { user, organizations, simulatedTenantData, simulatedPaymentRecords };
}

function generateTenantData(userId: string): TenantData {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const now = new Date();
  const moveInDate = new Date(now);
  moveInDate.setMonth(moveInDate.getMonth() - (hash % 24));

  const leaseLength = 12;
  const leaseEndDate = new Date(moveInDate);
  leaseEndDate.setMonth(leaseEndDate.getMonth() + leaseLength);

  if (leaseEndDate < now) {
    leaseEndDate.setMonth(leaseEndDate.getMonth() + leaseLength);
  }

  const paymentHistoryOptions = ['excellent', 'good', 'average', 'poor'];
  const leaseRenewalOptions = ['renewed', 'pending', 'not renewing'];

  return {
    moveInDate: moveInDate.toISOString(),
    leaseEndDate: leaseEndDate.toISOString(),
    currentLeaseLength: leaseLength,
    occupants: (hash % 4) + 1,
    rentAmount: 800 + (hash % 1200),
    paymentHistory: paymentHistoryOptions[hash % paymentHistoryOptions.length],
    leaseRenewalStatus: leaseRenewalOptions[hash % leaseRenewalOptions.length],
    specialRequirements: hash % 3 === 0 ? 'Pet friendly accommodation required' : null,
    rentalHistory: hash % 5,
  };
}

function generatePaymentHistory(userId: string): PaymentRecord[] {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const records: PaymentRecord[] = [];
  const paymentStatuses: Array<'paid' | 'late' | 'missed' | 'pending'> = [
    'paid',
    'paid',
    'paid',
    'late',
    'missed',
  ];
  const rentAmount = 800 + (hash % 1200);

  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const paymentDate = new Date(now);
    paymentDate.setMonth(paymentDate.getMonth() - i);
    paymentDate.setDate(5);

    if (paymentDate > now) continue;

    const statusIndex = (hash + i) % paymentStatuses.length;
    const status =
      i < 3
        ? Math.random() > 0.2
          ? 'paid'
          : paymentStatuses[statusIndex]
        : paymentStatuses[statusIndex];

    records.push({
      id: `payment-${userId}-${i}`,
      date: paymentDate.toISOString(),
      amount: rentAmount,
      status,
      lateBy: status === 'late' ? (hash % 10) + 1 : null,
    });
  }

  return records;
}

export default function UserDetails() {
  const { user, organizations, simulatedTenantData, simulatedPaymentRecords } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function handleEditUser() {
    setIsEditDialogOpen(true);
  }

  function handleDeleteClick() {
    setIsDeleteDialogOpen(true);
  }

  async function handleDeleteUser() {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      navigate('/dashboard/admin/users');
    } catch (error) {
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }

  const applications = user.applicationForms.map(app => ({
    id: app.id,
    status: app.status,
    createdAt: app.createdAt,
    resourceId: app.resourceId,
    resourceName: app.resource?.label,
  }));

  /*  const assignments = user.resourceAssignments.map(assignment => ({
    id: assignment.id,
    resourceId: assignment.resourceId,
    resourceName: assignment.resource?.label,
    resourceType: assignment.resource?.type,
    isActive: assignment.resource?.isActive,
    owners: assignment.resource?.owners || [],
  })); */

  function formatRoleName(role: Role) {
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <main className="space-y-8 p-8">
      <header className="flex items-center justify-between rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant={user.role === Role.ADMIN ? 'destructive' : 'secondary'}
                className="text-sm"
              >
                {formatRoleName(user.role)}
              </Badge>
              {user.identificationVerified ? (
                <Badge variant="success" className="flex items-center gap-1 text-sm">
                  <Check size={14} /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 text-sm">
                  <X size={14} /> Not Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditUser}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteClick}
              variant="destructive"
              className="hover:bg-destructive/40"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="space-y-6">
          <UserDetailsCard
            id={user.id}
            name={user.name}
            email={user.email}
            role={user.role}
            phoneNumber={user.phoneNumber}
            identificationVerified={user.identificationVerified}
            alternativeContact={user.alternativeContact}
          />

          <EmploymentDetailsCard
            employmentStatus={user.employmentStatus}
            employer={user.employer}
            monthlyIncome={user.monthlyIncome}
            creditScore={user.creditScore}
          />

          <IdentificationCard
            identificationDocumentType={user.identificationDocumentType}
            identificationDocumentNumber={user.identificationDocumentNumber}
            identificationVerified={user.identificationVerified}
            previousLandlordReference={user.previousLandlordReference}
          />

          {user.role === Role.TENANT && simulatedTenantData && (
            <TenantDetailsCard
              moveInDate={simulatedTenantData.moveInDate}
              leaseEndDate={simulatedTenantData.leaseEndDate}
              currentLeaseLength={simulatedTenantData.currentLeaseLength}
              occupants={simulatedTenantData.occupants}
              rentAmount={simulatedTenantData.rentAmount}
              paymentHistory={simulatedTenantData.paymentHistory}
              leaseRenewalStatus={simulatedTenantData.leaseRenewalStatus}
              specialRequirements={simulatedTenantData.specialRequirements}
              rentalHistory={simulatedTenantData.rentalHistory}
            />
          )}
        </aside>

        <section className="space-y-6">
          {user.role === Role.OWNER && user.ownedResources.length > 0 && (
            <article className="rounded-lg border bg-white p-6 shadow">
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Properties</h2>
                <Link to={`/dashboard/admin/users/${user.id}/properties`}>
                  <Button variant="outline" size="sm">
                    View All Properties
                  </Button>
                </Link>
              </header>
              <UserPropertiesCard userId={user.id} properties={user.ownedResources} />
            </article>
          )}

          {user.resourceAssignments && user.resourceAssignments.length > 0 && (
            <UserAssignmentsCard assignments={user.resourceAssignments} />
          )}

          <UserApplicationsCard applications={applications} />

          {user.role === Role.TENANT &&
            simulatedPaymentRecords &&
            simulatedPaymentRecords.length > 0 && (
              <RentPaymentHistory
                paymentRecords={simulatedPaymentRecords}
                currentRent={simulatedTenantData?.rentAmount || null}
                dueDate={5}
              />
            )}
        </section>

        <aside className="space-y-6">
          <OrganizationCard organization={user.organization} />

          <AdditionalInfoCard createdAt={user.createdAt} updatedAt={user.updatedAt} />

          {user.role === Role.TENANT && simulatedTenantData && (
            <Card>
              <CardHeader>
                <CardTitle>Lease Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <article className="rounded-md border p-3">
                  <header className="flex items-center gap-2">
                    <FileText className="text-primary h-4 w-4" />
                    <h3 className="font-medium">Lease Agreement</h3>
                  </header>
                  <p className="text-muted-foreground text-sm">
                    Signed on {new Date(simulatedTenantData.moveInDate).toLocaleDateString()}
                  </p>
                  <footer className="mt-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </footer>
                </article>

                <article className="rounded-md border p-3">
                  <header className="flex items-center gap-2">
                    <FileText className="text-primary h-4 w-4" />
                    <h3 className="font-medium">Property Condition Report</h3>
                  </header>
                  <p className="text-muted-foreground text-sm">
                    Completed on {new Date(simulatedTenantData.moveInDate).toLocaleDateString()}
                  </p>
                  <footer className="mt-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </footer>
                </article>
              </CardContent>
            </Card>
          )}
        </aside>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Make changes to {user.name}&apos;s profile information.
            </DialogDescription>
          </DialogHeader>
          <EditUserForm
            user={user}
            organizations={organizations}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSuccess={() => window.location.reload()}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete ${user.name}'s account? This action cannot be undone and will remove all associated data.`}
      />
    </main>
  );
}
