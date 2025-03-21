import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type Application = {
  id: string;
  createdAt: string | Date;
  status: string;
};

type ApplicationsCardProps = {
  applications: Application[];
};

export function ApplicationsCard({ applications }: ApplicationsCardProps) {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {applications.map(app => (
            <div key={app.id} className="flex items-center justify-between border-b pb-2">
              <span className="font-mono text-xs">{app.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
                <Badge
                  variant={
                    app.status === 'APPROVED'
                      ? 'success'
                      : app.status === 'PENDING'
                        ? 'warning'
                        : 'secondary'
                  }
                >
                  {app.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
