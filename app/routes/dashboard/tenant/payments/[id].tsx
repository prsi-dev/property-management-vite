import React from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { ArrowLeft, Download, CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Separator } from '~/components/ui/separator';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const paymentId = params.id;

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Check authentication
    const { supabase, headers } = createServerSupabase(request);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return redirectWithHeaders('/auth/login', headers, { status: 401 });
    }

    // Check if user has tenant rights
    const user = await prisma.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!user || user.role !== Role.TENANT) {
      return redirectWithHeaders('/dashboard', headers, { status: 403 });
    }

    // Find the tenant's assigned property through ResourceAssignment
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

    // If no resource is assigned, return an error
    if (!resourceAssignment) {
      throw new Error('No property is assigned to this tenant');
    }

    const resourceId = resourceAssignment.resourceId;

    // Get active rental contract for the tenant's property
    const rentalContract = await prisma.rentalContract.findFirst({
      where: {
        resourceId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        contractNumber: true,
      },
    });

    if (!rentalContract) {
      throw new Error('No active rental contract found');
    }

    // Get payment details and ensure it belongs to this tenant's contract
    const payment = await prisma.rentPayment.findUnique({
      where: {
        id: paymentId,
        contract: {
          id: rentalContract.id,
        },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        datePaid: true,
        status: true,
        paymentMethod: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        contract: {
          select: {
            contractNumber: true,
            resource: {
              select: {
                id: true,
                label: true,
                address: true,
                postalCode: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      // Either payment doesn't exist or doesn't belong to this tenant
      throw new Error('Payment not found or you do not have permission to view it');
    }

    // Format the payment data for the frontend
    const formattedPayment = {
      ...payment,
      dueDate: payment.dueDate.toISOString(),
      datePaid: payment.datePaid ? payment.datePaid.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };

    return {
      payment: formattedPayment,
    };
  } catch (error) {
    console.error('Error loading payment details:', error);
    return {
      payment: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantPaymentDetailPage() {
  const { payment, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (error) {
    toast.error('Error loading payment details', { description: error });
  }

  // If payment is null, show error state
  if (!payment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Payment Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <AlertCircle className="text-destructive h-12 w-12" />
              <h3 className="text-lg font-medium">Payment Not Found</h3>
              <p className="text-muted-foreground text-sm">
                The payment you are looking for does not exist or you do not have permission to view
                it.
              </p>
              <Button onClick={() => navigate('/dashboard/tenant/payments')}>
                Return to Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date with time for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get payment status badge variant
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'LATE':
        return 'destructive';
      case 'UPCOMING':
        return 'secondary';
      case 'PARTIAL':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get pretty payment method name
  const formatPaymentMethod = (method: string | null) => {
    if (!method) return 'Not specified';
    return method.replace('_', ' ');
  };

  // Get payment status icon
  const PaymentStatusIcon = () => {
    switch (payment.status) {
      case 'PAID':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'PENDING':
        return <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'LATE':
        return <AlertCircle className="text-destructive h-6 w-6" />;
      default:
        return <CreditCard className="text-muted-foreground h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Payment Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Payment for {payment.contract.resource.label}</CardDescription>
            </div>
            <Badge variant={getPaymentStatusBadge(payment.status)} className="px-2 py-1 text-sm">
              {payment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="bg-primary/10 flex items-center justify-center rounded-full p-4">
              <PaymentStatusIcon />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-4xl font-bold">{formatCurrency(payment.amount)}</div>
              <div className="text-muted-foreground">
                {payment.status === 'PAID'
                  ? `Paid on ${payment.datePaid ? formatDate(payment.datePaid) : 'Unknown'}`
                  : `Due on ${formatDate(payment.dueDate)}`}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Property</div>
              <div className="text-muted-foreground">{payment.contract.resource.label}</div>
              <div className="text-muted-foreground text-xs">
                {payment.contract.resource.address ? (
                  <>
                    {payment.contract.resource.address}
                    {payment.contract.resource.postalCode &&
                      `, ${payment.contract.resource.postalCode}`}
                  </>
                ) : (
                  'No address provided'
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Contract Number</div>
              <div className="text-muted-foreground">{payment.contract.contractNumber}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Due Date</div>
              <div className="text-muted-foreground">{formatDate(payment.dueDate)}</div>
            </div>

            {payment.datePaid && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Payment Date</div>
                <div className="text-muted-foreground">{formatDate(payment.datePaid)}</div>
              </div>
            )}

            {payment.paymentMethod && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Payment Method</div>
                <div className="text-muted-foreground">
                  {formatPaymentMethod(payment.paymentMethod)}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium">Created</div>
              <div className="text-muted-foreground">{formatDateTime(payment.createdAt)}</div>
            </div>
          </div>

          {payment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Notes</div>
                <div className="bg-muted rounded-md p-4 text-sm">{payment.notes}</div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          {payment.status === 'PENDING' || payment.status === 'LATE' ? (
            <Button className="w-full md:w-auto">Make Payment</Button>
          ) : (
            <div></div> // Empty div for spacing in case no payment button
          )}
          <Button variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
