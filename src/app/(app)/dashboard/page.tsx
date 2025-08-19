"use client";
import { useState, useEffect } from "react";
import { DollarSign, Users, Beer, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Sale } from "@/lib/types";

const recentSales: Sale[] = [
    { id: "SALE001", items: [{ drinkName: 'Tusker', quantity: 2, price: 400}], total: 400, paymentMethod: 'Mpesa', cashier: 'John D.', timestamp: '2024-08-19 10:30 PM'},
    { id: "SALE002", items: [{ drinkName: 'Drum (250ml)', quantity: 1, price: 220}], total: 220, paymentMethod: 'Cash', cashier: 'Jane S.', timestamp: '2024-08-19 10:25 PM'},
    { id: "SALE003", items: [{ drinkName: 'Guinness', quantity: 1, price: 250}], total: 250, paymentMethod: 'Mpesa', cashier: 'John D.', timestamp: '2024-08-19 10:15 PM'},
    { id: "SALE004", items: [{ drinkName: 'White Cap', quantity: 4, price: 800}], total: 800, paymentMethod: 'Cash', cashier: 'Jane S.', timestamp: '2024-08-19 10:05 PM'},
    { id: "SALE005", items: [{ drinkName: 'Tusker', quantity: 1, price: 200}], total: 200, paymentMethod: 'Cash', cashier: 'John D.', timestamp: '2024-08-19 09:50 PM'},
];


export default function DashboardPage() {
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    // Generate random sales data for the chart
    const generateSalesData = () => [
      { name: "Mon", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Tue", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Wed", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Thu", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Fri", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Sat", total: Math.floor(Math.random() * 20000) + 10000 },
      { name: "Sun", total: Math.floor(Math.random() * 20000) + 10000 },
    ];
    setSalesData(generateSalesData());
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh 452,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 Clocked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Seller</CardTitle>
            <Beer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tusker</div>
            <p className="text-xs text-muted-foreground">+120 units today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Sales Overview</CardTitle>
            <CardDescription>This week's sales performance.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Ksh ${value/1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))'
                  }}
                   formatter={(value: number) => [`Ksh ${value.toLocaleString()}`, "Sales"]}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Sales</CardTitle>
            <CardDescription>A list of the most recent transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="font-medium">{sale.cashier}</div>
                      <div className="text-sm text-muted-foreground">{sale.items[0].drinkName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentMethod === 'Cash' ? 'secondary' : 'outline'}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">Ksh {sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
