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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const [sales] = useLocalStorage<Sale[]>("pos-sales-history", []);
  const [salesData, setSalesData] = useState<any[]>([]);
  const { user } = useAuth();
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesToday = sales.filter(sale => new Date(sale.timestamp).toDateString() === new Date().toDateString()).length;
  
  const topSeller = sales.flatMap(s => s.items)
    .reduce((acc, item) => {
        acc[item.drinkName] = (acc[item.drinkName] || 0) + item.quantity;
        return acc;
    }, {} as {[key: string]: number});

  const topSellerName = Object.keys(topSeller).length > 0 ? Object.entries(topSeller).sort((a,b) => b[1] - a[1])[0][0] : "N/A";
  const topSellerUnits = Object.keys(topSeller).length > 0 ? Object.entries(topSeller).sort((a,b) => b[1] - a[1])[0][1] : 0;


  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    const initialSalesData = [
      { name: "Mon", total: Math.floor(Math.random() * 5000) },
      { name: "Tue", total: Math.floor(Math.random() * 5000) },
      { name: "Wed", total: Math.floor(Math.random() * 5000) },
      { name: "Thu", total: Math.floor(Math.random() * 5000) },
      { name: "Fri", total: Math.floor(Math.random() * 5000) },
      { name: "Sat", total: Math.floor(Math.random() * 5000) },
      { name: "Sun", total: Math.floor(Math.random() * 5000) },
    ];
    setSalesData(initialSalesData);
  }, []);

  const recentSales = sales.slice(0, 5);


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{sales.length} total transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">{user?.username} Clocked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Seller</CardTitle>
            <Beer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSellerName}</div>
            <p className="text-xs text-muted-foreground">{topSellerUnits} units sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSalesToday}</div>
            <p className="text-xs text-muted-foreground">transactions today</p>
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
                {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
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
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No recent sales
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
