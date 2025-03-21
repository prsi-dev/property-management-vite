import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { DollarSign, Briefcase } from 'lucide-react';

type EmploymentDetailsProps = {
  employmentStatus?: string | null;
  employer?: string | null;
  monthlyIncome?: number | null;
  creditScore?: number | null;
};

export function EmploymentDetailsCard({
  employmentStatus,
  employer,
  monthlyIncome,
  creditScore,
}: EmploymentDetailsProps) {
  if (!employmentStatus && !employer && !monthlyIncome && !creditScore) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment & Financial Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {employmentStatus && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <p>{employmentStatus}</p>
            </div>
          </div>
        )}
        {employer && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employer</h3>
            <p>{employer}</p>
          </div>
        )}
        {monthlyIncome !== null && monthlyIncome !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <p className="font-semibold">${monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        )}
        {creditScore !== null && creditScore !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Credit Score</h3>
            <p className="font-semibold">{creditScore}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
