
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Sale } from "@/lib/types";
import { History } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}


export default function OrderHistoryPage() {
  const [sales] = useLocalStorage<Sale[]>("pos-sales-history", []);

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

      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length > 0 ? (
                        sales.map((sale, index) => (
                            <TableRow key={sale.id || index}>
                                <TableCell className="font-mono text-xs">{formatDate(sale.timestamp)}</TableCell>
                                <TableCell>{sale.cashier}</TableCell>
                                <TableCell>
                                    {sale.items?.map((item, idx) => (
                                        <div key={item.id || idx}>{item.drinkName} (x{item.quantity})</div>
                                    ))}
                                </TableCell>
                                 <TableCell>
                                    <Badge variant={sale.paymentMethod === 'Cash' ? 'secondary' : 'outline'}>
                                        {sale.paymentMethod}
                                    </Badge>
                                    {sale.mpesaReceipt && <div className="text-xs text-muted-foreground mt-1">{sale.mpesaReceipt}</div>}
                                </TableCell>
                                <TableCell className="text-right font-semibold">Ksh {sale.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No order history found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
