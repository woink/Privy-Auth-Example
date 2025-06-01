import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletLoading() {
  return (
    <Card className="w-fit m-5">
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Wallet Address:</span>
          <Skeleton className="h-5 w-80 ml-2 inline-block" />
        </div>
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Balance:</span>
          <Skeleton className="h-5 w-32 ml-2 inline-block" />
        </div>
      </CardContent>
    </Card>
  );
}
