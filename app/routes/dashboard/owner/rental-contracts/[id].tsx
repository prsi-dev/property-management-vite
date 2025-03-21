import { useLoaderData, type LoaderFunctionArgs, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

// Helper function to format dates
function formatDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;

  // Ensure id is defined
  if (!id) {
    throw new Response('Contract ID is required', { status: 400 });
  }

  const { supabase, headers } = createServerSupabase(request);
  const { data: authData } = await supabase.auth.getUser();

  // Authentication check
  if (!authData.user) {
    return redirectWithHeaders('/auth/login', headers, { status: 401 });
  }

  // Check if user has owner rights
  const user = await prisma.user.findUnique({
    where: { email: authData.user.email },
    select: {
      id: true,
      role: true,
      email: true,
    },
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

  // Fetch the rental contract with related data
  const rentalContract = await prisma.rentalContract.findUnique({
    where: { id },
    include: {
      resource: {
        select: {
          id: true,
          label: true,
          address: true,
          type: true,
          assignments: {
            where: {
              role: Role.TENANT,
              isActive: true,
            },
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      rentPayments: {
        select: {
          id: true,
          amount: true,
          status: true,
          dueDate: true,
          datePaid: true,
          createdAt: true,
        },
        orderBy: {
          dueDate: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!rentalContract) {
    throw new Response('Rental contract not found', { status: 404 });
  }

  // Check if the rental contract is associated with one of the user's properties
  if (!resourceIds.includes(rentalContract.resourceId)) {
    return redirectWithHeaders('/dashboard/owner/rental-contracts', headers, { status: 403 });
  }

  // Extract tenants from resource assignments for easier use in the component
  const tenants = rentalContract.resource?.assignments
    ? rentalContract.resource.assignments.map(assignment => assignment.user)
    : [];

  return {
    rentalContract,
    tenants,
    userId: user.id,
  };
}

function getContractStatusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'secondary';
    case 'EXPIRED':
      return 'outline';
    case 'TERMINATED':
      return 'destructive';
    case 'RENEWED':
      return 'warning';
    default:
      return 'default';
  }
}

export default function OwnerRentalContractDetails() {
  const { rentalContract, tenants } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold">Contract {rentalContract.contractNumber}</h1>
          <Badge variant={getContractStatusBadgeVariant(rentalContract.status)}>
            {rentalContract.status}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contract Details */}
        <section aria-labelledby="contract-details-heading">
          <Card>
            <CardHeader>
              <CardTitle id="contract-details-heading">Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Contract Number</dt>
                  <dd>{rentalContract.contractNumber}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Status</dt>
                  <dd>{rentalContract.status}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Start Date</dt>
                  <dd>{formatDate(rentalContract.startDate)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">End Date</dt>
                  <dd>
                    {rentalContract.isOpenEnded ? 'Open-ended' : formatDate(rentalContract.endDate)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Rent Amount</dt>
                  <dd>${rentalContract.baseRentAmount?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Security Deposit</dt>
                  <dd>${rentalContract.securityDeposit?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Payment Frequency</dt>
                  <dd>{rentalContract.paymentFrequency || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Payment Due Day</dt>
                  <dd>{rentalContract.paymentDueDay || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>

        {/* Property Details */}
        <section aria-labelledby="property-details-heading">
          <Card>
            <CardHeader>
              <CardTitle id="property-details-heading">Property</CardTitle>
            </CardHeader>
            <CardContent>
              {rentalContract.resource ? (
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <a
                      href={`/dashboard/owner/properties/${rentalContract.resource.id}`}
                      className="hover:text-primary text-lg font-semibold"
                    >
                      {rentalContract.resource.label}
                    </a>
                    <div className="text-muted-foreground text-sm">
                      {rentalContract.resource.address || 'No address provided'}
                    </div>
                    <div className="text-sm">
                      Type: {rentalContract.resource.type || 'Not specified'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No property assigned</div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tenants */}
        {tenants && tenants.length > 0 && (
          <section aria-labelledby="tenants-heading">
            <Card>
              <CardHeader>
                <CardTitle id="tenants-heading">Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenants.map(tenant => (
                    <div key={tenant.id} className="flex flex-col rounded-md border p-3">
                      <span className="font-medium">{tenant.name}</span>
                      {tenant.email && (
                        <span className="text-muted-foreground text-sm">{tenant.email}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Recent Payments */}
        {rentalContract.rentPayments && rentalContract.rentPayments.length > 0 && (
          <section aria-labelledby="payments-heading">
            <Card>
              <CardHeader>
                <CardTitle id="payments-heading">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rentalContract.rentPayments.map(payment => (
                    <div key={payment.id} className="space-y-1 rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${payment.amount.toFixed(2)}</span>
                        <Badge variant={payment.status === 'PAID' ? 'success' : 'warning'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Due: {formatDate(payment.dueDate)}
                      </div>
                      {payment.datePaid && (
                        <div className="text-muted-foreground text-xs">
                          Paid: {formatDate(payment.datePaid)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Additional information */}
        <section aria-labelledby="additional-info-heading" className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle id="additional-info-heading">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Created</dt>
                  <dd>{formatDate(rentalContract.createdAt)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Last Updated</dt>
                  <dd>{formatDate(rentalContract.updatedAt)}</dd>
                </div>
                {rentalContract.terminationDate && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <dt className="font-medium">Termination Date</dt>
                      <dd>{formatDate(rentalContract.terminationDate)}</dd>
                    </div>
                    {rentalContract.terminationReason && (
                      <div className="grid grid-cols-2 gap-2">
                        <dt className="font-medium">Termination Reason</dt>
                        <dd>{rentalContract.terminationReason}</dd>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </article>
  );
}
