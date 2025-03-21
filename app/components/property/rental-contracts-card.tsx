import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

type RentalContract = {
  id: string;
  contractNumber: string;
  status?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  resource: {
    assignments: {
      id: string;
      user: {
        name: string;
      };
    }[];
  };
};

type RentalContractsCardProps = {
  contracts: RentalContract[];
  userRole?: 'ADMIN' | 'OWNER' | 'TENANT' | 'PROPERTY_MANAGER' | 'SERVICE_PROVIDER';
};

export function RentalContractsCard({ contracts, userRole = 'ADMIN' }: RentalContractsCardProps) {
  if (!contracts || contracts.length === 0) {
    return null;
  }

  // Determine the correct base path based on user role
  const getBasePath = () => {
    switch (userRole) {
      case 'OWNER':
        return '/dashboard/owner/rental-contracts';
      case 'PROPERTY_MANAGER':
        return '/dashboard/manager/rental-contracts';
      case 'TENANT':
        return '/dashboard/tenant/rental-contracts';
      case 'SERVICE_PROVIDER':
        return '/dashboard/service/rental-contracts';
      case 'ADMIN':
      default:
        return '/dashboard/admin/rental-contracts';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Contracts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contracts.map(contract => (
            <Link to={`${getBasePath()}/${contract.id}`} key={contract.id}>
              <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{contract.contractNumber}</h3>
                  {contract.status && (
                    <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
                  )}
                </div>

                {contract.resource &&
                  contract.resource.assignments &&
                  contract.resource.assignments.length > 0 && (
                    <div className="mb-2">
                      <p className="text-muted-foreground text-sm">Tenants:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {contract.resource.assignments.map((assignment, index) => (
                          <span key={assignment.id} className="text-sm">
                            {assignment.user.name}
                            {index < contract.resource.assignments.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="text-muted-foreground mt-2 flex justify-between text-sm">
                  <div>
                    Start:{' '}
                    {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    End:{' '}
                    {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Open'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get badge variant based on contract status
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'EXPIRED':
      return 'outline';
    case 'TERMINATED':
      return 'destructive';
    case 'DRAFT':
      return 'secondary';
    default:
      return 'default';
  }
}
