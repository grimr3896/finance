"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { PlusCircle, MoreHorizontal, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { Drink } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const initialDrinks: Drink[] = [
  { id: "DRK001", name: "Tusker", costPrice: 150, sellingPrice: 200, stock: 48, unit: 'bottle', barcode: '6161101410202' },
  { id: "DRK002", name: "Guinness", costPrice: 180, sellingPrice: 250, stock: 8, unit: 'bottle', barcode: '6161100110103' },
  { id: "DRK003", name: "White Cap", costPrice: 160, sellingPrice: 200, stock: 60, unit: 'bottle', barcode: '6161100110301' },
  { id: "DRK004", name: "Draft Beer", costPrice: 40000/200, sellingPrice: 220, stock: 35000, unit: 'ml', unitMl: 250, barcode: '0' },
  { id: "DRK005", name: "Heineken", costPrice: 170, sellingPrice: 230, stock: 72, unit: 'bottle', barcode: '8712000030393' },
  { id: "DRK006", name: "Pilsner", costPrice: 140, sellingPrice: 190, stock: 80, unit: 'bottle', barcode: '6161100110202' },
];

const LOW_STOCK_THRESHOLD = 10;

export function InventoryManager() {
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Partial<Drink> | null>(null);

  const handleAddNew = () => {
    setEditingDrink({});
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
    if (!editingDrink) return;

    // In a real app, you'd perform validation here (e.g., using a library like Zod)
    if (editingDrink.id) {
      // Update existing drink
      setDrinks(drinks.map(d => d.id === editingDrink.id ? editingDrink as Drink : d));
    } else {
      // Add new drink
      const newDrink: Drink = {
        id: `DRK${Date.now()}`,
        ...editingDrink,
      } as Drink;
      setDrinks([...drinks, newDrink]);
    }
    
    setIsDialogOpen(false);
    setEditingDrink(null);
  };

  const handleFieldChange = (field: keyof Drink, value: string | number) => {
    if(editingDrink) {
      setEditingDrink(prev => ({ ...prev, [field]: value }));
    }
  }
  
  const sortedDrinks = useMemo(() => {
    return [...drinks].sort((a, b) => a.name.localeCompare(b.name));
  }, [drinks]);

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
        <CardContent className="p-0">
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
              {sortedDrinks.map((drink) => (
                <TableRow key={drink.id}>
                  <TableCell className="font-medium">{drink.name}</TableCell>
                  <TableCell className="flex items-center">
                    {drink.unit === 'bottle' && drink.stock < LOW_STOCK_THRESHOLD && (
                      <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
                    )}
                    {drink.stock.toLocaleString()} {drink.unit}
                    {drink.unit === 'ml' && drink.unitMl && ` (${(drink.stock / drink.unitMl).toFixed(0)} servings)`}
                  </TableCell>
                  <TableCell>{drink.unit === 'bottle' ? 'Bottle' : `${drink.unitMl}ml Serving`}</TableCell>
                  <TableCell>Ksh {drink.sellingPrice.toFixed(2)}</TableCell>
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
                        <DropdownMenuSeparator />
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the item from your inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(drink.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingDrink?.id ? "Edit Drink" : "Add New Drink"}</DialogTitle>
            <DialogDescription>
              {editingDrink?.id ? "Update the details for this drink." : "Fill in the details for the new drink."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={editingDrink?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">Barcode</Label>
              <Input id="barcode" value={editingDrink?.barcode || ''} onChange={(e) => handleFieldChange('barcode', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Select value={editingDrink?.unit} onValueChange={(value) => handleFieldChange('unit', value)}>
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
              <Label htmlFor="stock" className="text-right">Stock Level</Label>
              <Input id="stock" type="number" value={editingDrink?.stock || ''} onChange={(e) => handleFieldChange('stock', +e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPrice" className="text-right">Cost Price</Label>
              <Input id="costPrice" type="number" value={editingDrink?.costPrice || ''} onChange={(e) => handleFieldChange('costPrice', +e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellingPrice" className="text-right">Selling Price</Label>
              <Input id="sellingPrice" type="number" value={editingDrink?.sellingPrice || ''} onChange={(e) => handleFieldChange('sellingPrice', +e.target.value)} className="col-span-3" />
            </div>
             {editingDrink?.unit === 'ml' && (
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitMl" className="text-right">Serving (ml)</Label>
                <Input id="unitMl" type="number" value={editingDrink?.unitMl || ''} onChange={(e) => handleFieldChange('unitMl', +e.target.value)} className="col-span-3" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
