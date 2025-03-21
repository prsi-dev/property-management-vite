import React from 'react';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { createServerSupabase } from '~/lib/supabase.server';
import { redirectWithHeaders } from '~/lib/utils';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { CreditCard, ArrowUp, ArrowDown, Clock } from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
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

    // If no resource is assigned, return empty data
    if (!resourceAssignment) {
      return {
        payments: [],
        property: null,
        rentalContract: null,
        nextPayment: null,
      };
    }

    const resourceId = resourceAssignment.resourceId;

    // Get property details
    const property = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        label: true,
        address: true,
        postalCode: true,
        type: true,
      },
    });

    // Get active rental contract for the tenant's property
    const rentalContract = await prisma.rentalContract.findFirst({
      where: {
        resourceId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        contractNumber: true,
        startDate: true,
        endDate: true,
        baseRentAmount: true,
        paymentFrequency: true,
        paymentDueDay: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Get payment history for the tenant's contract
    const payments = rentalContract
      ? await prisma.rentPayment.findMany({
          where: {
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
            createdAt: true,
          },
          orderBy: { dueDate: 'desc' },
        })
      : [];

    // Calculate next payment due
    const today = new Date();
    let nextPayment = null;

    if (rentalContract) {
      // Find the next unpaid payment
      const upcomingPayment = payments.find(
        p => p.status === 'PENDING' && new Date(p.dueDate) > today
      );

      if (upcomingPayment) {
        nextPayment = upcomingPayment;
      } else {
        // Calculate the next payment due date
        const paymentDueDay = rentalContract.paymentDueDay || 1;
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDueDay);

        nextPayment = {
          dueDate: nextMonth,
          amount: rentalContract.baseRentAmount,
          status: 'UPCOMING',
        };
      }
    }

    // Format the payments data
    const formattedPayments = payments.map(payment => ({
      ...payment,
      dueDate: payment.dueDate.toISOString(),
      datePaid: payment.datePaid ? payment.datePaid.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
    }));

    return {
      payments: formattedPayments,
      property,
      rentalContract: rentalContract
        ? {
            ...rentalContract,
            startDate: rentalContract.startDate.toISOString(),
            endDate: rentalContract.endDate ? rentalContract.endDate.toISOString() : null,
          }
        : null,
      nextPayment: nextPayment
        ? {
            ...nextPayment,
            dueDate:
              nextPayment.dueDate instanceof Date
                ? nextPayment.dueDate.toISOString()
                : nextPayment.dueDate,
          }
        : null,
    };
  } catch (error) {
    console.error('Error loading payment information:', error);
    return {
      payments: [],
      property: null,
      rentalContract: null,
      nextPayment: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function TenantPaymentsPage() {
  const { payments, property, rentalContract, nextPayment, error } = useLoaderData<typeof loader>();

  if (error) {
    toast.error('Error loading payment information:', { description: error });
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

  // Calculate days until due for next payment
  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rent Payments</h1>
      </div>

      {nextPayment ? (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle>Next Payment</CardTitle>
            <CardDescription>Your upcoming rent payment information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Amount Due</div>
              <div className="text-3xl font-bold">{formatCurrency(nextPayment.amount)}</div>
              <Badge variant={getPaymentStatusBadge(nextPayment.status)}>
                {nextPayment.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Due Date</div>
              <div className="text-xl font-medium">{formatDate(nextPayment.dueDate)}</div>
              <div className="text-muted-foreground text-sm">
                {getDaysUntilDue(nextPayment.dueDate)}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button className="w-full md:w-auto">Make Payment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have any upcoming rent payments. This could be because you do not have an
              active rental contract or all your payments are up to date.
            </p>
          </CardContent>
        </Card>
      )}

      {property && rentalContract ? (
        <Card>
          <CardHeader>
            <CardTitle>Rental Information</CardTitle>
            <CardDescription>Details about your rental property and contract</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Property</div>
              <div className="font-medium">{property.label}</div>
              <div className="text-muted-foreground text-sm">
                {property.address ? (
                  <>
                    {property.address}
                    {property.postalCode && `, ${property.postalCode}`}
                  </>
                ) : (
                  'No address provided'
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Contract</div>
              <div className="font-medium">{rentalContract.contractNumber}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(rentalContract.startDate)}{' '}
                {rentalContract.endDate
                  ? `- ${formatDate(rentalContract.endDate)}`
                  : '(No end date)'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Monthly Rent</div>
              <div className="font-medium">{formatCurrency(rentalContract.baseRentAmount)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Payment Frequency</div>
              <div className="font-medium">{rentalContract.paymentFrequency.replace('_', ' ')}</div>
              <div className="text-muted-foreground text-sm">
                Due on day {rentalContract.paymentDueDay || 1} of each period
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Rental Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have an active rental contract. Please contact your property manager if you
              believe this is an error.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payment History</h2>

        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map(payment => (
              <Link to={`/dashboard/tenant/payments/${payment.id}`} key={payment.id}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {payment.status === 'PAID' ? (
                          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <ArrowDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                            <ArrowUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {payment.status === 'PAID' ? 'Payment Completed' : 'Payment Due'}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {formatDate(payment.dueDate)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        <Badge variant={getPaymentStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>

                    {payment.datePaid && (
                      <div className="text-muted-foreground mt-2 flex items-center text-sm">
                        <Clock className="mr-1 h-4 w-4" />
                        Paid on {formatDate(payment.datePaid)}
                        {payment.paymentMethod && ` via ${payment.paymentMethod.replace('_', ' ')}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <CreditCard className="text-muted-foreground h-12 w-12" />
                <h3 className="text-lg font-medium">No Payment History</h3>
                <p className="text-muted-foreground text-sm">
                  You do not have any payment records yet. Your payment history will appear here
                  once you make your first payment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
