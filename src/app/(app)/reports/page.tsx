
"use client";

import { useState, useMemo } from "react";
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
import { Download, PlusCircle, DollarSign, TrendingDown, BarChart, FileText } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Expense, Sale, Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfToday, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";


export default function ReportsPage() {
  const [sales] = useLocalStorage<Sale[]>("pos-sales-history", []);
  const [products] = useLocalStorage<Product[]>("products", []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  const [activeTab, setActiveTab] = useState("all");

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: "",
    amount: 0,
    category: "Other",
    paymentMethod: "Cash",
    date: new Date().toISOString().split('T')[0],
  });

  const timeFilteredData = useMemo(() => {
    const now = new Date();
    let interval: Interval | null = null;

    switch (activeTab) {
      case "today":
        interval = { start: startOfToday(), end: now };
        break;
      case "week":
        interval = { start: startOfWeek(now), end: now };
        break;
      case "month":
        interval = { start: startOfMonth(now), end: now };
        break;
      default: // 'all'
        interval = null;
    }

    const filteredSales = interval
      ? sales.filter(sale => isWithinInterval(new Date(sale.timestamp), interval!))
      : sales;
    
    const filteredExpenses = interval
      ? expenses.filter(expense => isWithinInterval(new Date(expense.date), interval!))
      : expenses;

    return { filteredSales, filteredExpenses };

  }, [sales, expenses, activeTab]);

  const { filteredSales, filteredExpenses } = timeFilteredData;
  
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const profit = totalSales - totalExpenses;

  const salesByItem = filteredSales
    .flatMap(s => s.items)
    .reduce((acc, item) => {
      if (!item) return acc;
      if (!acc[item.drinkName]) {
        acc[item.drinkName] = { name: item.drinkName, quantitySold: 0, revenue: 0, profit: 0 };
      }
      const product = products.find(p => p.name === item.drinkName);
      const cost = product ? product.costPrice : item.price; // fallback to selling price if no cost found
      acc[item.drinkName].quantitySold += item.quantity;
      acc[item.drinkName].revenue += item.price * item.quantity;
      acc[item.drinkName].profit += (item.price - cost) * item.quantity;
      return acc;
    }, {} as { [key: string]: { name: string; quantitySold: number; revenue: number; profit: number } });
  
  const salesByItemList = Object.values(salesByItem).sort((a,b) => b.revenue - a.revenue);

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount && newExpense.category && newExpense.paymentMethod && newExpense.date) {
      const expenseToAdd: Expense = {
        id: `EXP${Date.now()}`,
        name: newExpense.name,
        amount: Number(newExpense.amount),
        category: newExpense.category,
        paymentMethod: newExpense.paymentMethod as 'Cash' | 'Mpesa' | 'Card',
        date: new Date(newExpense.date).toISOString(),
      };
      setExpenses([...expenses, expenseToAdd]);
      setIsExpenseDialogOpen(false);
      setNewExpense({ name: "", amount: 0, category: "Other", paymentMethod: "Cash", date: new Date().toISOString().split('T')[0] });
    }
  };

  const chartData = [
    { name: 'Financials', sales: totalSales, expenses: totalExpenses },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-headline font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">
              View financial and performance reports for your bar.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsExpenseDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh {totalSales.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                   <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh {totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                   <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>Ksh {profit.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="font-headline">Sales vs Expenses</CardTitle>
                  <CardDescription>A comparison of total sales and expenses for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={chartData} layout="vertical" barCategoryGap="20%">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" hide />
                           <Tooltip
                              cursor={{ fill: 'hsl(var(--muted))' }}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))'
                              }}
                              formatter={(value: number) => `Ksh ${value.toLocaleString()}`}
                          />
                          <Legend />
                          <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
                          <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 4, 4]} />
                      </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="font-headline">Sales & Profit by Item</CardTitle>
                   <CardDescription>Profitability of individual items for the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByItemList.length > 0 ? (
                        salesByItemList.map(item => (
                          <TableRow key={item.name}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantitySold}</TableCell>
                            <TableCell className={`text-right font-medium ${item.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              Ksh {item.profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No sales data available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Expense Log</CardTitle>
                  <CardDescription>A detailed list of all recorded expenses for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Expense</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{expense.name}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                             <TableCell>{expense.paymentMethod}</TableCell>
                            <TableCell className="text-right font-semibold">Ksh {expense.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No expenses recorded for this period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Expense</DialogTitle>
            <DialogDescription>Record a new business expense to track your spending.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Lunch for staff"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select 
                value={newExpense.category} 
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Salaries">Salaries</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                   <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (Ksh)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">Paid Via</Label>
               <Select 
                value={newExpense.paymentMethod} 
                onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value as 'Cash' | 'Mpesa' | 'Card' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mpesa">M-Pesa</SelectItem>
                  <SelectItem value="Card">Card/Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date ? String(newExpense.date).split('T')[0] : ''}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleAddExpense}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
