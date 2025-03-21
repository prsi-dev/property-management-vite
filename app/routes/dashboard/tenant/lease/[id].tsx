import { prisma } from '~/lib/db';
import { useLoaderData, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Home,
  DollarSign,
  AlertTriangle,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  calculateDaysRemaining,
  formatCurrency,
  formatDate,
  formatPaymentFrequency,
  getStatusBadgeVariant,
  getUtilityIcon,
} from '~/utils/utils';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const contractId = params.id;

    if (!contractId) {
      throw new Error('Lease contract ID is required');
    }

    const { supabase, headers } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return redirectWithHeaders('/auth/login', headers, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.TENANT) {
      return redirectWithHeaders('/dashboard', headers, { status: 403 });
    }

    const resourceAssignment = await prisma.resourceAssignment.findFirst({
      where: {
        userId: user.id,
        role: Role.TENANT,
        isActive: true,
      },
      select: {
        resourceId: true,
      },
    });

    if (!resourceAssignment) {
      throw new Error('No property assigned to this tenant');
    }

    const resourceId = resourceAssignment.resourceId;

    const contract = await prisma.rentalContract.findUnique({
      where: {
        id: contractId,
        resourceId: resourceId,
      },
      include: {
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
            type: true,
            bedroomCount: true,
            bathroomCount: true,
            squareFootage: true,
            owners: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignments: {
              where: {
                role: Role.PROPERTY_MANAGER,
                isActive: true,
              },
              select: {
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
          orderBy: {
            dueDate: 'desc',
          },
          take: 5,
          select: {
            id: true,
            amount: true,
            dueDate: true,
            status: true,
            datePaid: true,
          },
        },
      },
    });

    if (!contract) {
      throw new Error('Lease contract not found');
    }

    const formattedContract = {
      ...contract,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate ? contract.endDate.toISOString() : null,
      terminationDate: contract.terminationDate ? contract.terminationDate.toISOString() : null,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      resource: {
        ...contract.resource,
      },
      rentPayments: contract.rentPayments.map(payment => ({
        ...payment,
        dueDate: payment.dueDate.toISOString(),
        paymentDate: payment.datePaid ? payment.datePaid.toISOString() : null,
      })),
    };

    return { contract: formattedContract };
  } catch (error) {
    console.error('Error loading lease details:', error);
    return {
      contract: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantLeaseDetailPage() {
  const { contract, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (error) {
    toast.error('Error loading lease details:', { description: error });
  }

  if (!contract) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Lease Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="text-muted-foreground mb-4 h-16 w-16" />
              <h2 className="mb-2 text-2xl font-bold">Lease Contract Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The lease contract you&apos;re looking for doesn&apos;t exist or you don&apos;t have
                permission to view it.
              </p>
              <Button onClick={() => navigate('/dashboard/tenant/lease')}>
                Return to Lease Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = contract.endDate ? calculateDaysRemaining(contract.endDate) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lease Details</h1>
          <p className="text-muted-foreground">Contract Number: {contract.contractNumber}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Badge variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Start Date</div>
              <div className="font-medium">{formatDate(contract.startDate)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">End Date</div>
              <div className="font-medium">
                {contract.isOpenEnded ? 'Open-ended' : formatDate(contract.endDate)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Time Remaining</div>
              <div className="font-medium">
                {contract.isOpenEnded
                  ? 'Ongoing'
                  : daysRemaining
                    ? daysRemaining < 0
                      ? 'Expired'
                      : daysRemaining === 0
                        ? 'Expires today'
                        : `${daysRemaining} days`
                    : 'Not specified'}
              </div>
              {!contract.isOpenEnded &&
                daysRemaining !== null &&
                daysRemaining < 60 &&
                daysRemaining >= 0 && (
                  <Badge variant="warning" className="mt-1">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Expiring soon
                  </Badge>
                )}
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Last Updated</div>
              <div className="font-medium">{formatDate(contract.updatedAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <DollarSign className="text-primary mr-2 h-5 w-5" />
            <CardTitle>Financial Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Base Rent Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(contract.baseRentAmount)}</div>
              <div className="text-muted-foreground text-xs">
                {formatPaymentFrequency(contract.paymentFrequency)} payment
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Security Deposit</div>
              <div className="text-lg font-medium">{formatCurrency(contract.securityDeposit)}</div>
              <div className="flex items-center text-xs">
                {contract.depositPaid ? (
                  <span className="flex items-center text-green-600">
                    <Check className="mr-1 h-3 w-3" /> Paid
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Not paid
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Payment Details</div>
              <div className="font-medium">Due on day {contract.paymentDueDay} of the period</div>
              {contract.lateFeePercentage && (
                <div className="text-muted-foreground text-xs">
                  Late fee: {contract.lateFeePercentage}% of rent amount
                </div>
              )}
            </div>
          </div>

          {contract.includedUtilities && contract.includedUtilities.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-medium">Included Utilities</h3>
              <div className="flex flex-wrap gap-2">
                {contract.includedUtilities.map(utility => (
                  <Badge key={utility} variant="secondary" className="flex items-center">
                    {getUtilityIcon(utility)}
                    {utility.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {contract.utilityCharges && (
            <div className="mt-4">
              <div className="text-muted-foreground text-sm">Additional Utility Charges</div>
              <div className="font-medium">{formatCurrency(contract.utilityCharges)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Home className="text-primary mr-2 h-5 w-5" />
            <CardTitle>Property Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-semibold">{contract.resource.label}</h3>
              <p className="text-muted-foreground">{contract.resource.address}</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {contract.resource.bedroomCount !== null && (
                  <div>
                    <div className="text-muted-foreground text-xs">Bedrooms</div>
                    <div className="font-medium">{contract.resource.bedroomCount}</div>
                  </div>
                )}

                {contract.resource.bathroomCount !== null && (
                  <div>
                    <div className="text-muted-foreground text-xs">Bathrooms</div>
                    <div className="font-medium">{contract.resource.bathroomCount}</div>
                  </div>
                )}

                {contract.resource.squareFootage !== null && (
                  <div>
                    <div className="text-muted-foreground text-xs">Area</div>
                    <div className="font-medium">{contract.resource.squareFootage} sq ft</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Property Management</h3>

              {contract.resource.owners && contract.resource.owners.length > 0 && (
                <div className="mb-4">
                  <div className="text-muted-foreground text-sm">Owner</div>
                  <div className="font-medium">{contract.resource.owners[0].name}</div>
                </div>
              )}

              {contract.resource.assignments && contract.resource.assignments.length > 0 && (
                <div>
                  <div className="text-muted-foreground text-sm">Property Manager</div>
                  <div className="font-medium">{contract.resource.assignments[0].user.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {contract.resource.assignments[0].user.email}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {contract.rentPayments && contract.rentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="text-primary mr-2 h-5 w-5" />
                <CardTitle>Recent Payments</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/tenant/payments')}
              >
                View All Payments
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contract.rentPayments.map(payment => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <div className="font-medium">Payment due on {formatDate(payment.dueDate)}</div>
                    <div className="text-muted-foreground text-sm">
                      {payment.paymentDate
                        ? `Paid on ${formatDate(payment.paymentDate)}`
                        : 'Not paid yet'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(payment.amount)}</div>
                    <Badge variant={payment.status === 'PAID' ? 'success' : 'warning'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <FileText className="text-primary mr-2 h-5 w-5" />
            <CardTitle>Additional Contract Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm">Termination Notice Period</div>
              <div className="font-medium">{contract.terminationNotice} days</div>
            </div>

            {contract.rentIncreaseSchedule && (
              <div>
                <div className="text-muted-foreground text-sm">Rent Increase Schedule</div>
                <div className="font-medium">{contract.rentIncreaseSchedule}</div>
              </div>
            )}
          </div>

          {contract.contractDocumentUrl && (
            <div className="mt-6">
              <h3 className="mb-2 font-medium">Contract Document</h3>
              <a
                href={contract.contractDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center hover:underline"
              >
                View contract document
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}

          {contract.additionalDocuments && contract.additionalDocuments.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-medium">Additional Documents</h3>
              <div className="space-y-2">
                {contract.additionalDocuments.map((doc, index) => (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary block hover:underline"
                  >
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Document {index + 1}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
