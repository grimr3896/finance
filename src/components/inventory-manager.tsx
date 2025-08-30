
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/lib/types";
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Skeleton } from "@/components/ui/skeleton";


const initialProducts: Product[] = [
    { id: "DRK001", name: "Tusker", category: "Beer", quantity: 50, costPrice: 150, price: 250, barcode: "6161101410202", image: "https://picsum.photos/100/100?random=1" },
    { id: "DRK002", name: "Guinness", category: "Beer", quantity: 30, costPrice: 180, price: 300, barcode: "6161100110103", image: "https://picsum.photos/100/100?random=2" },
    { id: "DRK003", name: "White Cap", category: "Beer", quantity: 40, costPrice: 160, price: 280, barcode: "6161100110301", image: "https://picsum.photos/100/100?random=3" },
    { id: "DRK004", name: "Draft Beer", category: "Beer", quantity: 100, costPrice: 80, price: 150, barcode: "0", image: "https://picsum.photos/100/100?random=4" },
    { id: "DRK005", name: "Drum", category: "Spirit", quantity: 20, costPrice: 500, price: 800, barcode: "1", image: "https://picsum.photos/100/100?random=5" },
    { id: "DRK006", name: "Heineken", category: "Beer", quantity: 25, costPrice: 200, price: 350, barcode: "8712000030393", image: "https://picsum.photos/100/100?random=6" },
    { id: "DRK007", name: "Pilsner", category: "Beer", quantity: 45, costPrice: 150, price: 250, barcode: "6161100110202", image: "https://picsum.photos/100/100?random=7" },
];

const LOW_STOCK_THRESHOLD = 10;
const OUT_OF_STOCK_THRESHOLD = 0;

export function InventoryManager() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddNew = () => {
    setEditingProduct({});
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };
  
  const handleSave = () => {
    if (!editingProduct) return;

    if (editingProduct.id) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
      const newProduct: Product = {
        id: `PROD${Date.now()}`,
        ...editingProduct,
      } as Product;
      setProducts([...products, newProduct]);
    }
    
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleFieldChange = (field: keyof Product, value: string | number) => {
    if(editingProduct) {
      setEditingProduct(prev => ({ ...prev, [field]: value }));
    }
  }
  
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const getStockStatus = (product: Product): { label: string; color: string } => {
    if (product.quantity <= OUT_OF_STOCK_THRESHOLD) {
      return { label: 'Out of Stock', color: 'bg-red-600 text-red-50' };
    }
    if (product.quantity < LOW_STOCK_THRESHOLD) {
      return { label: 'Low Stock', color: 'bg-yellow-500 text-yellow-50' };
    }
    return { label: 'In Stock', color: 'bg-emerald-600 text-emerald-50' };
  };
  
  if (!user) {
    return null; // Or a loading spinner
  }

  const isAdmin = user.role === ROLE.ADMIN;


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground">Manage your product inventory.</p>
        </div>
        <Button onClick={handleAddNew} disabled={!isAdmin}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price (Ksh)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isClient ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
              ) : sortedProducts.length > 0 ? (
                sortedProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={cn("hover:bg-opacity-80", status.color)}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isAdmin}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)} disabled={!isAdmin}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()} disabled={!isAdmin}>Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product from your inventory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No products found. Add a new product to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingProduct?.id ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct?.id ? "Update the details for this product." : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={editingProduct?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" value={editingProduct?.category || ''} onChange={(e) => handleFieldChange('category', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" value={editingProduct?.quantity ?? ''} onChange={(e) => handleFieldChange('quantity', +e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPrice" className="text-right">Cost Price (Ksh)</Label>
              <Input 
                id="costPrice" 
                type="number" 
                value={editingProduct?.costPrice ?? ''} 
                onChange={(e) => handleFieldChange('costPrice', +e.target.value)} 
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Selling Price (Ksh)</Label>
              <Input 
                id="price" 
                type="number" 
                value={editingProduct?.price ?? ''} 
                onChange={(e) => handleFieldChange('price', +e.target.value)} 
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">Barcode</Label>
              <Input id="barcode" value={editingProduct?.barcode || ''} onChange={(e) => handleFieldChange('barcode', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-upload" className="text-right">Image</Label>
              <div className="col-span-3 flex items-center gap-2">
                {editingProduct?.image && (
                    <Image 
                        src={editingProduct.image} 
                        alt={editingProduct.name || 'Product Image'} 
                        width={40} 
                        height={40} 
                        className="rounded-md object-cover"
                    />
                )}
                <Input 
                  id="image-upload" 
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleFieldChange('image', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
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
