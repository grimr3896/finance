
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
import { PlusCircle, MinusCircle, Search, ScanBarcode, Loader2, CheckCircle } from "lucide-react";
import type { Drink, Sale } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Receipt } from "@/components/receipt";
import { requestMpesaPayment } from "@/ai/flows/mpesa-stk-push";

const availableDrinks: Drink[] = [
    { id: "DRK001", name: "Tusker", costPrice: 150, sellingPrice: 200, stock: 48, unit: 'bottle', barcode: '6161101410202', image: "https://placehold.co/150x150.png" },
    { id: "DRK002", name: "Guinness", costPrice: 180, sellingPrice: 250, stock: 36, unit: 'bottle', barcode: '6161100110103', image: "https://placehold.co/150x150.png" },
    { id: "DRK003", name: "White Cap", costPrice: 160, sellingPrice: 200, stock: 60, unit: 'bottle', barcode: '6161100110301', image: "https://placehold.co/150x150.png" },
    { id: "DRK004", name: "Draft Beer (250ml)", costPrice: 40000/200, sellingPrice: 220, stock: 35000, unit: 'ml', unitMl: 250, barcode: '0', image: "https://placehold.co/150x150.png" },
    { id: "DRK005", name: "Drum (250ml)", costPrice: 180, sellingPrice: 220, stock: 100, unit: 'ml', unitMl: 250, barcode: '1', image: "https://placehold.co/150x150.png" },
    { id: "DRK006", name: "Heineken", costPrice: 170, sellingPrice: 230, stock: 72, unit: 'bottle', barcode: '8712000030393', image: "https://placehold.co/150x150.png" },
    { id: "DRK007", name: "Pilsner", costPrice: 140, sellingPrice: 190, stock: 80, unit: 'bottle', barcode: '6161100110202', image: "https://placehold.co/150x150.png" },
];

type CartItem = {
    drink: Drink;
    quantity: number;
};

type CompletedSale = {
  sale: Sale;
  cashReceived?: number;
  changeDue: number;
}

export function PosTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<CompletedSale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "M-Pesa" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [mpesaStep, setMpesaStep] = useState<'enterPhone' | 'pending' | 'success' | 'failed'>('enterPhone');
  const [customerPhone, setCustomerPhone] = useState("");
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
  
  const resetCashout = () => {
    setIsCashoutOpen(false);
    setCashReceived("");
    setCustomerPhone("");
    setMpesaStep('enterPhone');
    setPaymentMethod(null);
  }

  const handleConfirmPayment = (mpesaReceiptNumber?: string) => {
    const sale: Sale = {
        id: `SALE${Date.now()}`,
        items: cart.map(item => ({
            drinkName: item.drink.name,
            quantity: item.quantity,
            price: item.drink.sellingPrice,
        })),
        total,
        paymentMethod: paymentMethod!,
        cashier: "John Doe", // Replace with actual logged in user
        timestamp: new Date().toISOString(),
        mpesaReceipt: mpesaReceiptNumber,
    };
    
    setLastSale({
      sale,
      cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
      changeDue,
    });
    
    setCart([]);
    resetCashout();
    setIsReceiptOpen(true);
    
    toast({
        title: "Sale Completed",
        description: `Payment of Ksh ${total.toFixed(2)} received via ${paymentMethod}.`,
    })
  };
  
  const handleMpesaPayment = async () => {
    if (customerPhone.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number.',
      });
      return;
    }

    setMpesaStep('pending');

    try {
      const result = await requestMpesaPayment({
        phoneNumber: customerPhone,
        amount: total,
      });

      if (result.success) {
        setMpesaStep('success');
        setTimeout(() => {
          handleConfirmPayment(result.mpesaReceiptNumber);
        }, 1500);
      } else {
        setMpesaStep('failed');
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setMpesaStep('failed');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred during payment.',
      });
    }
  };

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash') return 0;
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < total) return 0;
    return received - total;
  }, [cashReceived, total, paymentMethod]);


  return (
    <>
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col bg-card/50">
              <CardHeader>
                  <CardTitle className="font-headline text-primary">Available Drinks</CardTitle>
                  <div className="relative mt-2 flex gap-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search for a drink..." 
                          className="pl-8" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline" size="icon" onClick={() => router.push('/pos/scan')}>
                          <ScanBarcode />
                      </Button>
                  </div>
              </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 overflow-y-auto p-4">
              {filteredDrinks.map((drink) => (
                <Card
                  key={drink.id}
                  className="overflow-hidden cursor-pointer group border-border/50 hover:border-primary transition-all duration-200 ease-in-out shadow-sm hover:shadow-lg hover:shadow-primary/20 bg-card"
                  onClick={() => addToCart(drink)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {drink.image && (
                      <Image src={drink.image} alt={drink.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint="drink bottle" />
                    )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-sm font-medium text-foreground truncate">{drink.name}</p>
                    <p className="text-xs text-primary font-semibold">Ksh {drink.sellingPrice.toFixed(2)}</p>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-full flex-col bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Current Order</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
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
                  <Button size="lg" variant="secondary" onClick={() => openCashoutModal('Cash')} disabled={cart.length === 0}>Cash</Button>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openCashoutModal('M-Pesa')} disabled={cart.length === 0}>M-Pesa</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isCashoutOpen} onOpenChange={(open) => !open && resetCashout()}>
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
                 <div className="py-4">
                    {mpesaStep === 'enterPhone' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone-number" className="text-right">Phone Number</Label>
                            <Input 
                                id="phone-number" 
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="col-span-3" 
                                placeholder="e.g. 0712345678"
                            />
                        </div>
                    )}
                    {mpesaStep === 'pending' && (
                         <div className="flex flex-col items-center justify-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Sending STK push to customer...</p>
                            <p>Awaiting payment confirmation.</p>
                        </div>
                    )}
                     {mpesaStep === 'success' && (
                         <div className="flex flex-col items-center justify-center space-y-2 text-emerald-500">
                            <CheckCircle className="h-8 w-8" />
                            <p className="font-semibold">Payment Received!</p>
                            <p>Finalizing sale...</p>
                        </div>
                    )}
                     {mpesaStep === 'failed' && (
                         <div className="flex flex-col items-center justify-center space-y-2 text-destructive">
                            <CheckCircle className="h-8 w-8" />
                            <p className="font-semibold">Payment Failed</p>
                            <p>Please try again or use another payment method.</p>
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={resetCashout}>Cancel</Button>
                {paymentMethod === 'Cash' ? (
                    <Button 
                        type="submit" 
                        onClick={() => handleConfirmPayment()}
                        disabled={parseFloat(cashReceived) < total || isNaN(parseFloat(cashReceived))}
                    >
                        Confirm Payment
                    </Button>
                ) : (
                     <Button 
                        type="button" 
                        onClick={handleMpesaPayment}
                        disabled={mpesaStep !== 'enterPhone' || customerPhone.length < 10}
                    >
                        {mpesaStep === 'enterPhone' ? "Request Payment" : <Loader2 className="h-4 w-4 animate-spin" />}
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-sm">
            <DialogHeader>
                <DialogTitle className="font-headline text-primary">Transaction Receipt</DialogTitle>
            </DialogHeader>
            {lastSale && <Receipt sale={lastSale.sale} cashReceived={lastSale.cashReceived} changeDue={lastSale.changeDue} />}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                <Button type="button">Print</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
