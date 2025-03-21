import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

type Event = {
  id: string;
  label: string;
  type: string;
  status?: string;
  startDate?: string | Date | null;
};

type EventsCardProps = {
  events: Event[];
  userRole?: 'ADMIN' | 'OWNER' | 'TENANT' | 'PROPERTY_MANAGER' | 'SERVICE_PROVIDER';
};

export function EventsCard({ events, userRole = 'ADMIN' }: EventsCardProps) {
  if (!events || events.length === 0) {
    return null;
  }

  // Determine the correct base path based on user role
  const getBasePath = () => {
    switch (userRole) {
      case 'OWNER':
        return '/dashboard/owner/events';
      case 'PROPERTY_MANAGER':
        return '/dashboard/manager/events';
      case 'TENANT':
        return '/dashboard/tenant/events';
      case 'SERVICE_PROVIDER':
        return '/dashboard/service/events';
      case 'ADMIN':
      default:
        return '/dashboard/admin/events';
    }
  };

  // Format date in a readable way
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map(event => (
            <Link to={`${getBasePath()}/${event.id}`} key={event.id}>
              <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{event.label}</h3>
                  {event.status && (
                    <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{event.type}</span>
                  {event.startDate && (
                    <span className="text-muted-foreground text-sm">
                      {formatDate(event.startDate)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get badge variant based on event status
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'PENDING':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
}
