
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { PlusCircle, MinusCircle, Search, ScanBarcode, X } from "lucide-react";
import type { Drink } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "M-Pesa" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const router = useRouter();
  const { toast } = useToast();

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
  
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.drink.sellingPrice * item.quantity, 0), [cart]);

  const filteredDrinks = availableDrinks.filter(drink => 
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const openCashoutModal = (method: "Cash" | "M-Pesa") => {
    if (cart.length === 0) {
        toast({
            variant: "destructive",
            title: "Cart is empty",
            description: "Please add items to the cart before cashing out.",
        });
        return;
    }
    setPaymentMethod(method);
    setIsCashoutOpen(true);
  };

  const handleConfirmPayment = () => {
    // In a real app, you would handle payment processing here
    // For M-Pesa, trigger STK push. For Cash, just record the sale.
    
    // 1. Record the sale in sales history
    console.log({
        items: cart,
        total,
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
    });
    
    // 2. Update inventory levels
    
    // 3. Print receipt
    
    // 4. Reset for new order
    setCart([]);
    setCashReceived("");
    setIsCashoutOpen(false);
    setPaymentMethod(null);
    
    toast({
        title: "Sale Completed",
        description: `Payment of Ksh ${total.toFixed(2)} received via ${paymentMethod}.`,
    })
  };

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash') return 0;
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < total) return 0;
    return received - total;
  }, [cashReceived, total, paymentMethod]);


  return (
    <>
      <div className="grid h-[calc(100vh-4rem)] grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
              <CardHeader>
                  <CardTitle className="font-headline text-primary">Available Drinks</CardTitle>
                  <div className="relative mt-2 flex gap-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search for a drink..." 
                          className="pl-8 bg-card border-border" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline" size="icon" onClick={() => router.push('/pos/scan')}>
                          <ScanBarcode />
                      </Button>
                  </div>
              </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 overflow-y-auto p-2">
              {filteredDrinks.map((drink) => (
                <Button
                  key={drink.id}
                  variant="outline"
                  className="h-24 flex-col justify-between p-2 text-center border-border/50 hover:bg-accent hover:border-primary transition-all duration-200 ease-in-out shadow-sm hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => addToCart(drink)}
                >
                  <span className="text-sm font-medium text-foreground whitespace-normal">{drink.name}</span>
                  <span className="text-xs text-primary font-semibold">Ksh {drink.sellingPrice.toFixed(2)}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Current Order</CardTitle>
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
                              <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.drink.id, item.quantity - 1)}>
                                      <MinusCircle className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center">{item.quantity}</span>
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
            <CardFooter className="flex-col !p-4 border-t">
              <div className="flex w-full justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">Ksh {total.toFixed(2)}</span>
              </div>
              <div className="mt-4 grid w-full grid-cols-2 gap-2">
                  <Button size="lg" variant="secondary" onClick={() => openCashoutModal('Cash')}>Cash</Button>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openCashoutModal('M-Pesa')}>M-Pesa</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isCashoutOpen} onOpenChange={setIsCashoutOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline text-primary">{paymentMethod} Payment</DialogTitle>
                <DialogDescription>
                    Total amount due: <strong>Ksh {total.toFixed(2)}</strong>
                </DialogDescription>
            </DialogHeader>
            {paymentMethod === 'Cash' && (
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cash-received" className="text-right">Cash Received</Label>
                        <Input 
                            id="cash-received" 
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="col-span-3" 
                            placeholder="e.g. 5000"
                        />
                    </div>
                    <div className="text-center text-2xl font-bold">
                        <p>Change Due:</p>
                        <p className="text-primary">Ksh {changeDue.toFixed(2)}</p>
                    </div>
                </div>
            )}
            {paymentMethod === 'M-Pesa' && (
                <div className="py-4 text-center">
                    <p className="text-muted-foreground">
                        An STK push will be sent to the customer's phone to complete the payment of <strong>Ksh {total.toFixed(2)}</strong>.
                    </p>
                </div>
            )}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCashoutOpen(false)}>Cancel</Button>
                <Button 
                    type="submit" 
                    onClick={handleConfirmPayment}
                    disabled={paymentMethod === 'Cash' && (parseFloat(cashReceived) < total || isNaN(parseFloat(cashReceived)))}
                >
                    Confirm Payment
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
