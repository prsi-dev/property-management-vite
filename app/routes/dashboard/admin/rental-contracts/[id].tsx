import { useLoaderData, type LoaderFunctionArgs, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  // Fetch rental contract with detailed information
  const rentalContract = await prisma.rentalContract.findUnique({
    where: { id },
    include: {
      resource: {
        include: {
          assignments: {
            include: {
              user: true,
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
        },
        orderBy: {
          dueDate: 'desc',
        },
      },
      metadata: {
        select: {
          id: true,
          key: true,
          value: true,
          createdAt: true,
        },
      },
    },
  });

  if (!rentalContract) {
    throw new Response('Rental contract not found', { status: 404 });
  }

  return rentalContract;
}

export default function RentalContractDetails() {
  const rentalContract = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Format dates
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Contract {rentalContract.contractNumber}</h1>
          <Badge variant={rentalContract.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {rentalContract.status || 'N/A'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contract Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Contract Number</div>
                <div>{rentalContract.contractNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Status</div>
                <div>{rentalContract.status || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Start Date</div>
                <div>{formatDate(rentalContract.startDate)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">End Date</div>
                <div>{formatDate(rentalContract.endDate)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Rent Amount</div>
                <div>${rentalContract.baseRentAmount?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Security Deposit</div>
                <div>${rentalContract.securityDeposit?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Payment Frequency</div>
                <div>{rentalContract.paymentFrequency || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Payment Due Day</div>
                <div>{rentalContract.paymentDueDay || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property</CardTitle>
          </CardHeader>
          <CardContent>
            {rentalContract.resource ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Link to={`/dashboard/admin/properties/${rentalContract.resource.id}`}>
                    <div className="hover:text-primary text-lg font-semibold">
                      {rentalContract.resource.label}
                    </div>
                  </Link>
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

        {/* Tenants */}
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {rentalContract.resource?.assignments &&
            rentalContract.resource.assignments.filter(assignment => assignment.role === 'TENANT')
              .length > 0 ? (
              <div className="space-y-4">
                {rentalContract.resource.assignments
                  .filter(assignment => assignment.role === 'TENANT')
                  .map(tenant => (
                    <Link
                      to={`/dashboard/admin/users/${tenant.user.id}`}
                      key={tenant.id}
                      className="hover:bg-muted flex items-center gap-3 rounded-md p-2"
                    >
                      <div className="bg-muted h-10 w-10 overflow-hidden rounded-full">
                        <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                          {tenant.user.name?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{tenant.user.name}</div>
                        <div className="text-muted-foreground text-sm">{tenant.user.email}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No tenants assigned</div>
            )}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {rentalContract.rentPayments && rentalContract.rentPayments.length > 0 ? (
              <div className="space-y-4">
                {rentalContract.rentPayments.map(payment => (
                  <div key={payment.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">${payment.amount?.toFixed(2) || '0.00'}</div>
                      <Badge
                        variant={
                          payment.status === 'PAID'
                            ? 'success'
                            : payment.status === 'PENDING'
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {payment.status || 'unknown'}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 text-sm">
                      <div>Due Date:</div>
                      <div>{formatDate(payment.dueDate)}</div>
                      {payment.datePaid && (
                        <>
                          <div>Paid Date:</div>
                          <div>{formatDate(payment.datePaid)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No payment records</div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {rentalContract.contractDocumentUrl ? (
              <div className="space-y-2">
                <a
                  href={rentalContract.contractDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-muted flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">Contract Document</div>
                    <div className="text-muted-foreground text-xs">
                      PDF • {new Date(rentalContract.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-primary text-sm">View</div>
                </a>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No contract document available</div>
            )}

            {/* Additional Documents */}
            {rentalContract.additionalDocuments &&
              rentalContract.additionalDocuments.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 font-medium">Additional Documents</div>
                  <div className="space-y-2">
                    {rentalContract.additionalDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-muted flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <div className="font-medium">Additional Document {index + 1}</div>
                        </div>
                        <div className="text-primary text-sm">View</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {rentalContract.metadata && rentalContract.metadata.length > 0 ? (
              <div className="space-y-4">
                {rentalContract.metadata.map(field => (
                  <div key={field.id} className="rounded-md border p-4">
                    <div className="font-medium">{field.key}</div>
                    <div className="text-sm">{field.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No metadata</div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Created</div>
                <div>{formatDate(rentalContract.createdAt)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Last Updated</div>
                <div>{formatDate(rentalContract.updatedAt)}</div>
              </div>
              {rentalContract.terminationDate && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Termination Date</div>
                    <div>{formatDate(rentalContract.terminationDate)}</div>
                  </div>
                  {rentalContract.terminationReason && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Termination Reason</div>
                      <div>{rentalContract.terminationReason}</div>
                    </div>
                  )}
                </>
              )}
              {rentalContract.metadataGroupId && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Metadata Group</div>
                  <div>{rentalContract.metadataGroupId}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
