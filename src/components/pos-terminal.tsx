"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle, Search, ScanBarcode } from "lucide-react";
import type { Drink } from "@/lib/types";

const availableDrinks: Drink[] = [
    { id: "DRK001", name: "Tusker", costPrice: 150, sellingPrice: 200, stock: 48, unit: 'bottle', barcode: '6161101410202' },
    { id: "DRK002", name: "Guinness", costPrice: 180, sellingPrice: 250, stock: 36, unit: 'bottle', barcode: '6161100110103' },
    { id: "DRK003", name: "White Cap", costPrice: 160, sellingPrice: 200, stock: 60, unit: 'bottle', barcode: '6161100110301' },
    { id: "DRK004", name: "Draft Beer (250ml)", costPrice: 40000/200, sellingPrice: 220, stock: 35000, unit: 'ml', unitMl: 250, barcode: '0' },
    { id: "DRK005", name: "Drum (250ml)", costPrice: 180, sellingPrice: 220, stock: 100, unit: 'ml', unitMl: 250, barcode: '1' },
    { id: "DRK006", name: "Heineken", costPrice: 170, sellingPrice: 230, stock: 72, unit: 'bottle', barcode: '8712000030393' },
    { id: "DRK007", name: "Pilsner", costPrice: 140, sellingPrice: 190, stock: 80, unit: 'bottle', barcode: '6161100110202' },
];

type CartItem = {
    drink: Drink;
    quantity: number;
};

export function PosTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const scannedDrinkId = localStorage.getItem("scannedDrinkId");
    if (scannedDrinkId) {
      const drinkToAdd = availableDrinks.find(d => d.id === scannedDrinkId);
      if (drinkToAdd) {
        addToCart(drinkToAdd);
      }
      localStorage.removeItem("scannedDrinkId");
    }
  }, []);

  const addToCart = (drink: Drink) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.drink.id === drink.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.drink.id === drink.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { drink, quantity: 1 }];
    });
  };

  const updateQuantity = (drinkId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(drinkId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.drink.id === drinkId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (drinkId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.drink.id !== drinkId));
  };
  
  const total = cart.reduce((sum, item) => sum + item.drink.sellingPrice * item.quantity, 0);

  const filteredDrinks = availableDrinks.filter(drink => 
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline">Available Drinks</CardTitle>
                <div className="relative mt-2 flex gap-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search or scan barcode..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="icon" onClick={() => router.push('/pos/scan')}>
                        <ScanBarcode />
                    </Button>
                </div>
            </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredDrinks.map((drink) => (
              <Button
                key={drink.id}
                variant="outline"
                className="h-24 flex-col justify-between p-2 text-center"
                onClick={() => addToCart(drink)}
              >
                <span className="text-sm font-medium">{drink.name}</span>
                <span className="text-xs text-muted-foreground">Ksh {drink.sellingPrice.toFixed(2)}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Current Order</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
                 <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Cart is empty</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-[120px]">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cart.map((item) => (
                        <TableRow key={item.drink.id}>
                        <TableCell className="font-medium">{item.drink.name}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.drink.id, item.quantity - 1)}>
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <span>{item.quantity}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.drink.id, item.quantity + 1)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            Ksh {(item.drink.sellingPrice * item.quantity).toFixed(2)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
          <CardFooter className="flex-col !p-4">
             <div className="flex w-full justify-between text-2xl font-bold">
                <span>Total</span>
                <span>Ksh {total.toFixed(2)}</span>
             </div>
             <div className="mt-4 grid w-full grid-cols-2 gap-2">
                <Button size="lg" variant="secondary">Cash</Button>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">M-Pesa</Button>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
