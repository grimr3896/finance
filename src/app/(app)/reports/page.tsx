
"use client";

import { useState } from "react";
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
import { Download, PlusCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Expense, Sale, Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  const [sales] = useLocalStorage<Sale[]>("pos-sales-history", []);
  const [products] = useLocalStorage<Product[]>("products", []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

  // Calculations for the selected period (we'll just use all data for now)
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalSales - totalExpenses;

  const salesByItem = sales
    .flatMap(s => s.items)
    .reduce((acc, item) => {
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
  const bestSeller = salesByItemList.length > 0 ? salesByItemList[0].name : "N/A";

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expenseToAdd: Expense = {
        id: `EXP${Date.now()}`,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString(),
      };
      setExpenses([...expenses, expenseToAdd]);
      setIsExpenseDialogOpen(false);
      setNewExpense({ description: "", amount: "" });
    }
  };

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

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">All Time</TabsTrigger>
            {/* Add Weekly/Monthly later */}
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh {totalSales.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh {totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>Ksh {profit.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bestSeller}</div>
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
                      {salesByItemList.length > 0 ? (
                        salesByItemList.map(item => (
                          <TableRow key={item.name}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantitySold}</TableCell>
                            <TableCell>Ksh {item.revenue.toFixed(2)}</TableCell>
                            <TableCell className={`text-right font-medium ${item.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              Ksh {item.profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No sales data available.
                          </TableCell>
                        </TableRow>
                      )}
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
                      {expenses.length > 0 ? (
                        expenses.map(expense => (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell className="text-right">Ksh {expense.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No expenses recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (Ksh)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
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
