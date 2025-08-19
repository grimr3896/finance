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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Drink } from "@/lib/types";

const initialDrinks: Drink[] = [
  { id: "DRK001", name: "Tusker", costPrice: 150, sellingPrice: 200, stock: 48, unit: 'bottle' },
  { id: "DRK002", name: "Guinness", costPrice: 180, sellingPrice: 250, stock: 36, unit: 'bottle' },
  { id: "DRK003", name: "White Cap", costPrice: 160, sellingPrice: 200, stock: 60, unit: 'bottle' },
  { id: "DRK004", name: "Draft Beer Drum", costPrice: 40000, sellingPrice: 220, stock: 35000, unit: 'ml', unitMl: 250 },
];

export function InventoryManager() {
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);

  const handleAddNew = () => {
    setEditingDrink(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDrinks(drinks.filter((drink) => drink.id !== id));
  };
  
  const handleSave = () => {
    // In a real app, you'd handle form state and submission here
    setIsDialogOpen(false);
    setEditingDrink(null);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage your bar's drink inventory.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Drink
        </Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Unit Type</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drinks.map((drink) => (
                <TableRow key={drink.id}>
                  <TableCell className="font-medium">{drink.name}</TableCell>
                  <TableCell>
                    {drink.stock.toLocaleString()} {drink.unit}
                    {drink.unit === 'ml' && drink.unitMl && ` (${(drink.stock / drink.unitMl).toFixed(0)} servings)`}
                  </TableCell>
                  <TableCell>{drink.unit === 'bottle' ? 'Bottle' : `${drink.unitMl}ml Serving`}</TableCell>
                  <TableCell>${drink.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(drink)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(drink.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingDrink ? "Edit Drink" : "Add New Drink"}</DialogTitle>
            <DialogDescription>
              {editingDrink ? "Update the details for this drink." : "Fill in the details for the new drink."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" defaultValue={editingDrink?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stock Level</Label>
              <Input id="stock" type="number" defaultValue={editingDrink?.stock} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Select defaultValue={editingDrink?.unit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="ml">Milliliters (ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellingPrice" className="text-right">Selling Price</Label>
              <Input id="sellingPrice" type="number" defaultValue={editingDrink?.sellingPrice} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
