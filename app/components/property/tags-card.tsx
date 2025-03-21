import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type Tag = {
  id: string;
  name: string;
};

type TagsCardProps = {
  tags: Tag[];
};

export function TagsCard({ tags }: TagsCardProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag.id} variant="secondary" className="px-3 py-1">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
