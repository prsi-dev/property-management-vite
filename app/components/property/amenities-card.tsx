import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type AmenitiesCardProps = {
  amenities: string[];
};

export function AmenitiesCard({ amenities }: AmenitiesCardProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
