import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Users, Home, Calendar, Clock, History } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

type TenantDetailsProps = {
  moveInDate?: string | null;
  leaseEndDate?: string | null;
  currentLeaseLength?: number | null;
  occupants?: number | null;
  rentAmount?: number | null;
  paymentHistory?: string | null;
  leaseRenewalStatus?: string | null;
  specialRequirements?: string | null;
  rentalHistory?: number | null;
};

export function TenantDetailsCard({
  moveInDate,
  leaseEndDate,
  currentLeaseLength,
  occupants,
  rentAmount,
  paymentHistory,
  leaseRenewalStatus,
  specialRequirements,
  rentalHistory,
}: TenantDetailsProps) {
  // If no tenant data available, don't render the card
  if (
    !moveInDate &&
    !leaseEndDate &&
    !currentLeaseLength &&
    !occupants &&
    !rentAmount &&
    !paymentHistory &&
    !leaseRenewalStatus &&
    !specialRequirements &&
    !rentalHistory
  ) {
    return null;
  }

  // Format date strings for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to determine payment history badge
  const getPaymentBadge = (history: string) => {
    switch (history?.toLowerCase()) {
      case 'excellent':
        return <Badge variant="success">Excellent</Badge>;
      case 'good':
        return <Badge variant="secondary">Good</Badge>;
      case 'average':
        return <Badge variant="outline">Average</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">Not Recorded</Badge>;
    }
  };

  // Function to determine lease renewal status badge
  const getRenewalBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'renewed':
        return <Badge variant="success">Renewed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'not renewing':
        return <Badge variant="destructive">Not Renewing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {moveInDate && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Move-in Date</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <time>{formatDate(moveInDate)}</time>
            </div>
          </section>
        )}
        {leaseEndDate && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Lease End Date</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <time>{formatDate(leaseEndDate)}</time>
            </div>
          </section>
        )}
        {currentLeaseLength !== null && currentLeaseLength !== undefined && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Current Lease Length</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <p>{currentLeaseLength} months</p>
            </div>
          </section>
        )}
        {occupants !== null && occupants !== undefined && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Occupants</h3>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <p>
                {occupants} {occupants === 1 ? 'person' : 'people'}
              </p>
            </div>
          </section>
        )}
        {rentAmount !== null && rentAmount !== undefined && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Monthly Rent</h3>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              <p className="font-semibold">${rentAmount.toLocaleString()}</p>
            </div>
          </section>
        )}
        {paymentHistory && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Payment History</h3>
            <div className="flex items-center gap-2">{getPaymentBadge(paymentHistory)}</div>
          </section>
        )}
        {leaseRenewalStatus && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Lease Renewal Status</h3>
            <div className="flex items-center gap-2">{getRenewalBadge(leaseRenewalStatus)}</div>
          </section>
        )}
        {specialRequirements && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Special Requirements</h3>
            <p className="text-sm">{specialRequirements}</p>
          </section>
        )}
        {rentalHistory !== null && rentalHistory !== undefined && (
          <section>
            <h3 className="text-sm font-medium text-gray-500">Rental History</h3>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-gray-500" />
              <p>
                {rentalHistory} previous {rentalHistory === 1 ? 'rental' : 'rentals'}
              </p>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
