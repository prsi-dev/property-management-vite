import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { FileText } from 'lucide-react';

type IdentificationCardProps = {
  identificationDocumentType?: string | null;
  identificationDocumentNumber?: string | null;
  identificationVerified: boolean;
  previousLandlordReference?: string | null;
};

export function IdentificationCard({
  identificationDocumentType,
  identificationDocumentNumber,
  identificationVerified,
  previousLandlordReference,
}: IdentificationCardProps) {
  if (!identificationDocumentType && !identificationDocumentNumber && !previousLandlordReference) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identification & References</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {identificationDocumentType && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID Document Type</h3>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <p>{identificationDocumentType}</p>
            </div>
          </div>
        )}
        {identificationDocumentNumber && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID Document Number</h3>
            <p className="font-mono">{identificationDocumentNumber}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
          <Badge variant={identificationVerified ? 'success' : 'warning'}>
            {identificationVerified ? 'Verified' : 'Not Verified'}
          </Badge>
        </div>
        {previousLandlordReference && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Previous Landlord Reference</h3>
            <p>{previousLandlordReference}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
