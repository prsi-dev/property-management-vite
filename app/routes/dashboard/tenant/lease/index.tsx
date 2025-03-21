import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { FileText, Home, Calendar, DollarSign, Clock } from 'lucide-react';
import { getStatusBadgeVariant } from '~/utils/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
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
      return {
        contracts: [],
        property: null,
      };
    }

    const resourceId = resourceAssignment.resourceId;

    const property = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        label: true,
        address: true,
        type: true,
      },
    });

    const contracts = await prisma.rentalContract.findMany({
      where: {
        resourceId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        baseRentAmount: true,
        securityDeposit: true,
        createdAt: true,
        updatedAt: true,
        resource: {
          select: {
            id: true,
            label: true,
            address: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const formattedContracts = contracts.map(contract => ({
      ...contract,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate ? contract.endDate.toISOString() : null,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }));

    const maintenanceRequests = await prisma.event.findMany({
      where: {
        resourceId,
        type: 'MAINTENANCE_REQUEST',
      },
      select: {
        id: true,
        label: true,
        status: true,
        startDate: true,
        createdAt: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      contracts: formattedContracts,
      property,
      maintenanceRequests,
    };
  } catch (error) {
    console.error('Error loading lease information:', error);
    return {
      contracts: [],
      property: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantLeasePage() {
  const { contracts, property, maintenanceRequests, error } = useLoaderData<typeof loader>();

  if (error) {
    toast.error('Error loading lease information:', { description: error });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDaysRemaining = (endDateString: string | null) => {
    if (!endDateString) return 'No end date';

    const endDate = new Date(endDateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    return `${diffDays} days remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lease Information</h1>
      </div>

      {property ? (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Home className="text-primary mr-2 h-5 w-5" />
              <CardTitle>Property Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">{property.label}</h3>
                <p className="text-muted-foreground">
                  {property.address ? <>{property.address}</> : 'No address provided'}
                </p>
                <div className="mt-2">
                  <Badge>{property.type}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Property Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have any property assigned to your account. Please contact your
              property manager.
            </p>
          </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-bold">Active Leases</h2>

      {contracts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map(contract => (
            <Link to={`/dashboard/tenant/lease/${contract.id}`} key={contract.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">Lease Agreement</CardTitle>
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="text-muted-foreground">Period</span>
                    </div>
                    <p className="text-sm">
                      {formatDate(contract.startDate)} -{' '}
                      {contract.endDate ? formatDate(contract.endDate) : 'No end date'}
                    </p>
                    <div className="text-primary text-sm font-medium">
                      {contract.endDate ? calculateDaysRemaining(contract.endDate) : 'Ongoing'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span className="text-muted-foreground">Monthly Rent</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(contract.baseRentAmount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span className="text-muted-foreground">Security Deposit</span>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(contract.securityDeposit)}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <FileText className="text-muted-foreground h-12 w-12" />
              <h3 className="text-lg font-medium">No Active Leases</h3>
              <p className="text-muted-foreground text-sm">
                You don&apos;t have any active lease agreements. Please contact your property
                manager for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {maintenanceRequests && maintenanceRequests.length > 0 && (
        <div className="space-y-4">
          {maintenanceRequests.map(request => (
            <Card className="transition-shadow hover:shadow-md" key={request.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{request.label}</CardTitle>
                  <CardDescription className="mt-1">
                    Created on {formatDate(request.createdAt.toISOString())}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center">
                    <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      Requested for: {formatDate(request.startDate.toISOString())}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      {new Date(request.createdAt.toISOString()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {request.notes && (
                  <div className="mt-4">
                    <p className="line-clamp-2 text-sm">{request.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
