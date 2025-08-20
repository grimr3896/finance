import { History } from "lucide-react";

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-headline font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Order History
        </h2>
        <p className="text-muted-foreground">
          View a log of all past transactions.
        </p>
      </div>
      {/* TODO: Implement the full order history component here */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96">
        <p className="mt-4 text-muted-foreground">Order history will be displayed here.</p>
      </div>
    </div>
  );
}
