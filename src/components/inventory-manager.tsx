
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
import { PlusCircle, MoreHorizontal } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth, ROLE } from "@/lib/auth";


const initialDrinks: Drink[] = [
  { id: "DRK001", name: "Tusker", costPrice: 150, sellingPrice: 200, stock: 48, unit: 'bottle', barcode: '6161101410202', image: "https://placehold.co/150x150.png", sold: 12, required: 12, received: 0 },
  { id: "DRK002", name: "Guinness", costPrice: 180, sellingPrice: 250, stock: 8, unit: 'bottle', barcode: '6161100110103', image: "https://placehold.co/150x150.png", sold: 5, required: 5, received: 0 },
  { id: "DRK003", name: "White Cap", costPrice: 160, sellingPrice: 200, stock: 60, unit: 'bottle', barcode: '6161100110301', image: "https://placehold.co/150x150.png", sold: 2, required: 2, received: 2},
  { id: "DRK004", name: "Draft Beer", costPrice: 40000/200, sellingPrice: 220, stock: 35000, unit: 'ml', unitMl: 250, barcode: '0', image: "https://placehold.co/150x150.png", sold: 1000, required: 1000, received: 0 },
  { id: "DRK005", name: "Heineken", costPrice: 170, sellingPrice: 230, stock: 2, unit: 'bottle', barcode: '8712000030393', image: "https://placehold.co/150x150.png", sold: 22, required: 22, received: 24 },
  { id: "DRK006", name: "Pilsner", costPrice: 140, sellingPrice: 190, stock: 80, unit: 'bottle', barcode: '6161100110202', image: "https://placehold.co/150x150.png", sold: 0, required: 0, received: 0 },
];

const LOW_STOCK_THRESHOLD = 10;
const OUT_OF_STOCK_THRESHOLD = 5;

export function InventoryManager() {
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Partial<Drink> | null>(null);
  const { user } = useAuth();

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

    if (editingDrink.id) {
      setDrinks(drinks.map(d => d.id === editingDrink.id ? editingDrink as Drink : d));
    } else {
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

  const handleReceivedChange = (drinkId: string, value: number) => {
    setDrinks(drinks.map(d => d.id === drinkId ? { ...d, received: value } : d));
  }

  const handleRestock = (drinkId: string) => {
    setDrinks(drinks.map(d => {
      if (d.id === drinkId) {
        return {
          ...d,
          stock: d.stock + d.received,
          sold: 0,
          required: 0,
          received: 0
        };
      }
      return d;
    }));
  }
  
  const sortedDrinks = useMemo(() => {
    return [...drinks].sort((a, b) => a.name.localeCompare(b.name));
  }, [drinks]);

  const getStockStatus = (drink: Drink): { label: string; color: string } => {
    if (drink.unit === 'ml') { // For drinks sold in ml, we assume they don't run out in the same way
      return { label: 'Well Stocked', color: 'bg-emerald-600 text-emerald-50' };
    }
    if (drink.stock < OUT_OF_STOCK_THRESHOLD) {
      return { label: 'Out of Stock', color: 'bg-red-600 text-red-50' };
    }
    if (drink.stock < LOW_STOCK_THRESHOLD) {
      return { label: 'Low Stock', color: 'bg-yellow-500 text-yellow-50' };
    }
    return { label: 'Well Stocked', color: 'bg-emerald-600 text-emerald-50' };
  };
  
  if (!user) {
    return null; // Or a loading spinner
  }

  const isCashier = user.role === ROLE.CASHIER;


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage your bar's drink inventory.</p>
        </div>
        <Button onClick={handleAddNew} disabled={isCashier}>
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
                <TableHead>Status</TableHead>
                <TableHead>Sold Today</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDrinks.map((drink) => {
                const status = getStockStatus(drink);
                const variance = drink.required - drink.received;
                return (
                  <TableRow key={drink.id}>
                    <TableCell className="font-medium">{drink.name}</TableCell>
                    <TableCell>
                      {drink.stock.toLocaleString()} {drink.unit}
                      {drink.unit === 'ml' && drink.unitMl && ` (${(drink.stock / drink.unitMl).toFixed(0)} servings)`}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("hover:bg-opacity-80", status.color)}>{status.label}</Badge>
                    </TableCell>
                     <TableCell>{drink.sold}</TableCell>
                    <TableCell>{drink.required}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="h-8 w-20" 
                          value={drink.received}
                          onChange={(e) => handleReceivedChange(drink.id, parseInt(e.target.value) || 0)}
                        />
                         {variance !== 0 && (
                          <Badge variant={variance > 0 ? "destructive" : "secondary"}>
                            {variance > 0 ? `Short ${variance}` : `Over ${Math.abs(variance)}`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right flex justify-end items-center gap-2">
                      <Button size="sm" onClick={() => handleRestock(drink.id)}>Restock</Button>
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
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()} disabled={isCashier}>Delete</DropdownMenuItem>
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
                );
              })}
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
              <Input id="name" value={editingDrink?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" disabled={isCashier} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">Barcode</Label>
              <Input id="barcode" value={editingDrink?.barcode || ''} onChange={(e) => handleFieldChange('barcode', e.target.value)} className="col-span-3" disabled={isCashier} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Image URL</Label>
              <Input id="image" value={editingDrink?.image || ''} onChange={(e) => handleFieldChange('image', e.target.value)} className="col-span-3" disabled={isCashier} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Select value={editingDrink?.unit} onValueChange={(value) => handleFieldChange('unit', value)} disabled={isCashier}>
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
              <Label htmlFor="costPrice" className="text-right">Cost Price (Ksh)</Label>
              <Input 
                id="costPrice" 
                type="number" 
                value={editingDrink?.costPrice || ''} 
                onChange={(e) => handleFieldChange('costPrice', +e.target.value)} 
                className="col-span-3"
                disabled={isCashier}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellingPrice" className="text-right">Selling Price (Ksh)</Label>
              <Input 
                id="sellingPrice" 
                type="number" 
                value={editingDrink?.sellingPrice || ''} 
                onChange={(e) => handleFieldChange('sellingPrice', +e.target.value)} 
                className="col-span-3"
                disabled={isCashier}
              />
            </div>
             {editingDrink?.unit === 'ml' && (
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitMl" className="text-right">Serving (ml)</Label>
                <Input id="unitMl" type="number" value={editingDrink?.unitMl || ''} onChange={(e) => handleFieldChange('unitMl', +e.target.value)} className="col-span-3" disabled={isCashier} />
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
