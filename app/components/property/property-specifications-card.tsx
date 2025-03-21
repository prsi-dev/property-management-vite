import { BedDouble, Bath, Move, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type PropertySpecificationsProps = {
  bedroomCount?: number | null;
  bathroomCount?: number | null;
  squareFootage?: number | null;
  rentAmount?: number | null;
};

export function PropertySpecificationsCard({
  bedroomCount,
  bathroomCount,
  squareFootage,
  rentAmount,
}: PropertySpecificationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Bedrooms</p>
              <p className="font-semibold">{bedroomCount || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Bathrooms</p>
              <p className="font-semibold">{bathroomCount || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Move className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Square Footage</p>
              <p className="font-semibold">{squareFootage ? `${squareFootage} sq ft` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Rent</p>
              <p className="font-semibold">{rentAmount ? `$${rentAmount}/month` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
