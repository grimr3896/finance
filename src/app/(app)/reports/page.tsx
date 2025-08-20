
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

const expenses = [
  { id: 'EXP001', description: 'Stock Purchase - Tusker Crates', amount: 15000, date: '2024-08-19' },
  { id: 'EXP002', description: 'Staff Salaries - July', amount: 80000, date: '2024-08-15' },
  { id: 'EXP003', description: 'Utilities - Electricity Bill', amount: 5500, date: '2024-08-10' },
  { id: 'EXP004', description: 'Stock Purchase - Draft Beer Drum', amount: 40000, date: '2024-08-05' },
];

const salesByItem = [
    { name: 'Tusker', quantitySold: 120, revenue: 24000, cost: 18000, profit: 6000 },
    { name: 'Guinness', quantitySold: 80, revenue: 20000, cost: 14400, profit: 5600 },
    { name: 'White Cap', quantitySold: 95, revenue: 19000, cost: 15200, profit: 3800 },
    { name: 'Heineken', quantitySold: 60, revenue: 13800, cost: 10200, profit: 3600 },
    { name: 'Draft Beer (250ml)', quantitySold: 150, revenue: 33000, cost: 30000, profit: 3000 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            View financial and performance reports for your bar.
          </p>
        </div>
         <Button>
          <Download className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ksh 42,250.50</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ksh 12,000.00</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">Ksh 30,250.50</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Tusker</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Sales & Profit by Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Qty Sold</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead className="text-right">Profit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesByItem.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantitySold}</TableCell>
                                    <TableCell>Ksh {item.revenue.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium text-emerald-500">Ksh {item.profit.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {expenses.map(expense => (
                              <TableRow key={expense.id}>
                                  <TableCell>{expense.date}</TableCell>
                                  <TableCell>{expense.description}</TableCell>
                                  <TableCell className="text-right">Ksh {expense.amount.toFixed(2)}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
