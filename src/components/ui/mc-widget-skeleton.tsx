import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";

export default function McWidgetSkeleton() {
  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/20 py-5 shadow-2xl rounded-3xl w-full group relative">
      <CardContent className="flex items-center gap-4 py-0 px-5">
        <div className="flex items-center justify-center shadow-lg">
          <Skeleton className="w-11 h-11 rounded-lg" />
        </div>
        <div className="flex justify-between flex-col min-w-0 flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
