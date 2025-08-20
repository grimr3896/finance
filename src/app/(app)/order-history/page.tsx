
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

const fakeSales: Sale[] = [
    { id: "SALE001", items: [{ drinkName: 'Tusker', quantity: 2, price: 400}], total: 400, paymentMethod: 'Mpesa', cashier: 'John D.', timestamp: '2024-08-19T22:30:00Z', mpesaReceipt: 'SGH45OI89K'},
    { id: "SALE002", items: [{ drinkName: 'Drum (250ml)', quantity: 1, price: 220}], total: 220, paymentMethod: 'Cash', cashier: 'Jane S.', timestamp: '2024-08-19T22:25:00Z'},
    { id: "SALE003", items: [{ drinkName: 'Guinness', quantity: 1, price: 250}], total: 250, paymentMethod: 'Mpesa', cashier: 'John D.', timestamp: '2024-08-19T22:15:00Z', mpesaReceipt: 'SGH45OI88J'},
    { id: "SALE004", items: [{ drinkName: 'White Cap', quantity: 4, price: 800}], total: 800, paymentMethod: 'Cash', cashier: 'Jane S.', timestamp: '2024-08-19T22:05:00Z'},
    { id: "SALE005", items: [{ drinkName: 'Tusker', quantity: 1, price: 200}], total: 200, paymentMethod: 'Cash', cashier: 'John D.', timestamp: '2024-08-19T21:50:00Z'},
    { id: "SALE006", items: [{ drinkName: 'Heineken', quantity: 2, price: 460}, {drinkName: 'Pilsner', quantity: 1, price: 190}], total: 650, paymentMethod: 'Card', cashier: 'Jane S.', timestamp: '2024-08-19T21:45:00Z'},
    { id: "SALE007", items: [{ drinkName: 'Guinness', quantity: 3, price: 750}], total: 750, paymentMethod: 'Mpesa', cashier: 'John D.', timestamp: '2024-08-19T21:30:00Z', mpesaReceipt: 'SGH45OI87F'},
];

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}


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
                    {fakeSales.map(sale => (
                        <TableRow key={sale.id}>
                            <TableCell className="font-mono text-xs">{formatDate(sale.timestamp)}</TableCell>
                            <TableCell>{sale.cashier}</TableCell>
                            <TableCell>
                                {sale.items.map(item => `${item.drinkName} (x${item.quantity})`).join(', ')}
                            </TableCell>
                             <TableCell>
                                <Badge variant={sale.paymentMethod === 'Cash' ? 'secondary' : 'outline'}>
                                    {sale.paymentMethod}
                                </Badge>
                                {sale.mpesaReceipt && <div className="text-xs text-muted-foreground mt-1">{sale.mpesaReceipt}</div>}
                            </TableCell>
                            <TableCell className="text-right font-semibold">Ksh {sale.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
