import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Link } from 'react-router';
import { FileText, Calendar } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

type Application = {
  id: string;
  status: string;
  createdAt: string | Date;
  resourceId: string | null;
  resourceName?: string | null;
};

type UserApplicationsCardProps = {
  applications: Application[];
};

export function UserApplicationsCard({ applications }: UserApplicationsCardProps) {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {applications.map(application => (
            <div key={application.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <FileText className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      Application{' '}
                      <span className="font-mono text-xs text-gray-500">{application.id}</span>
                    </p>
                    {application.resourceId && application.resourceName && (
                      <Link
                        to={`/dashboard/admin/properties/${application.resourceId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {application.resourceName}
                      </Link>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    application.status === 'APPROVED'
                      ? 'success'
                      : application.status === 'PENDING'
                        ? 'warning'
                        : 'destructive'
                  }
                >
                  {application.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
