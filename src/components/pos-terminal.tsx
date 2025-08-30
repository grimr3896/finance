
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
import { PlusCircle, MinusCircle, Search, ScanBarcode, XCircle } from "lucide-react";
import type { Product, Sale } from "@/lib/types";
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
import { Receipt } from "@/components/receipt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/lib/auth";
import Image from "next/image";


type CartItem = {
    product: Product;
    quantity: number;
};

type CompletedSale = {
  sale: Sale;
  cashReceived?: number;
  changeDue: number;
}

const initialSales: Sale[] = [
    {
      id: "SALE1668522720000",
      items: [
        { id: "SI001", drinkName: "Tusker", quantity: 2, price: 250 },
        { id: "SI002", drinkName: "Guinness", quantity: 1, price: 300 },
      ],
      total: 800,
      paymentMethod: "Cash",
      cashier: "Admin User",
      timestamp: "2024-08-18T14:22:00Z",
    },
    {
      id: "SALE1668523820000",
      items: [
        { id: "SI003", drinkName: "White Cap", quantity: 4, price: 280 },
      ],
      total: 1120,
      paymentMethod: "Mpesa",
      cashier: "Cashier User",
      timestamp: "2024-08-19T18:10:00Z",
      mpesaReceipt: "SGH45T6F7G",
    },
];


export function PosTerminal() {
  const [products] = useLocalStorage<Product[]>("products", []);
  const [cart, setCart] = useLocalStorage<CartItem[]>("pos-cart", []);
  const [salesHistory, setSalesHistory] = useLocalStorage<Sale[]>("pos-sales-history", initialSales);
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<CompletedSale | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Mpesa" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const scannedBarcode = localStorage.getItem("scannedBarcode");
        if (scannedBarcode) {
            const productToAdd = products.find(p => p.barcode === scannedBarcode);
            if (productToAdd) {
                addToCart(productToAdd);
                 toast({
                    title: "Item Scanned",
                    description: `${productToAdd.name} added to cart.`,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Scan Error",
                    description: `Product with barcode ${scannedBarcode} not found.`,
                });
            }
            localStorage.removeItem("scannedBarcode");
        }
    }
  }, [products]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const total = useMemo(() => cart.reduce((sum, item) => {
    if (item && item.product && typeof item.product.price === 'number') {
        return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0), [cart]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.quantity > 0
  );
  
  const openCashoutModal = (method: "Cash" | "Card" | "Mpesa") => {
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
    setMpesaPhone("");
    setMpesaCode("");
    setPaymentMethod(null);
  }

  const handleConfirmPayment = () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "No user logged in." });
        return;
    }

    const sale: Sale = {
        id: `SALE${Date.now()}`,
        items: cart.map(item => ({
            drinkName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
        })),
        total,
        paymentMethod: paymentMethod!,
        cashier: user.username,
        timestamp: new Date().toISOString(),
        mpesaReceipt: paymentMethod === 'Mpesa' ? mpesaCode : undefined,
        mpesaPhone: paymentMethod === 'Mpesa' ? mpesaPhone : undefined,
    };
    
    // Update stock levels
    const updatedProducts = products.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
            return { ...p, quantity: p.quantity - cartItem.quantity };
        }
        return p;
    });
    // This part should be handled by the inventory manager logic, but for now we'll update the local state.
    // In a real app, this would trigger a call to an API to update the database.
    // For now, we're relying on the fact that useLocalStorage will persist this.
    // setProducts(updatedProducts); // This should be done on the inventory page to avoid conflicts.

    const completedSale: CompletedSale = {
      sale,
      cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
      changeDue,
    };

    setLastSale(completedSale);
    setSalesHistory(prev => [sale, ...prev]);
    
    setCart([]);
    resetCashout();
    setIsReceiptOpen(true);
    
    toast({
        title: "Sale Completed",
        description: `Payment of Ksh ${total.toFixed(2)} received via ${paymentMethod}.`,
    })
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash') return 0;
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < total) return 0;
    return received - total;
  }, [cashReceived, total, paymentMethod]);

  const validCart = useMemo(() => cart.filter(item => item && item.product), [cart]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col bg-card/50">
              <CardHeader>
                  <CardTitle className="font-headline text-primary">Available Products</CardTitle>
                  <div className="relative mt-2 flex gap-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search for a product..." 
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="cursor-pointer flex flex-col bg-card hover:border-primary transition-all overflow-hidden"
                    >
                      <div className="relative w-full aspect-square">
                        <Image src={product.image || "https://picsum.photos/100/100"} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="beverage bottle" />
                      </div>
                      <div className="p-2 text-center flex-1 flex flex-col justify-between">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-primary font-semibold">Ksh {product.price.toFixed(2)}</p>
                      </div>
                    </Card>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center text-muted-foreground">
                    No products in inventory. Please add items on the Inventory page.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-full flex-col bg-card">
            <Tabs defaultValue="order" className="flex flex-col h-full">
              <CardHeader className="p-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="order">Current Order</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>
              </CardHeader>
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="order" className="m-0 p-2 h-full">
                    {validCart.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Cart is empty</p>
                        </div>
                    ) : (
                      <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="w-[120px]">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {validCart.map((item) => (
                                <TableRow key={item.product.id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    Ksh {(item.product.price * item.quantity).toFixed(2)}
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                         <div className="p-2 mt-4">
                            <Button variant="outline" className="w-full" onClick={clearCart}>
                                <XCircle className="mr-2 h-4 w-4" /> Clear Cart
                            </Button>
                        </div>
                        </>
                    )}
                </TabsContent>
                <TabsContent value="history" className="m-0 h-full">
                  <ScrollArea className="h-full px-4">
                      {salesHistory.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No sales yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {salesHistory.slice(0, 20).map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                                <div>
                                    <p className="font-mono text-xs">{sale.id}</p>
                                    <p className="text-muted-foreground text-xs">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <p className="font-semibold text-primary">Ksh {(sale.total || 0).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                  </ScrollArea>
                </TabsContent>
              </div>
              <CardFooter className="flex-col !p-4 border-t">
                <div className="flex w-full justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">Ksh {total.toFixed(2)}</span>
                </div>
                <div className="mt-4 grid w-full grid-cols-3 gap-2">
                    <Button size="lg" variant="secondary" onClick={() => openCashoutModal('Cash')} disabled={cart.length === 0}>Cash</Button>
                    <Button size="lg" variant="outline" onClick={() => openCashoutModal('Card')} disabled={cart.length === 0}>Card</Button>
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openCashoutModal('Mpesa')} disabled={cart.length === 0}>M-Pesa</Button>
                </div>
              </CardFooter>
            </Tabs>
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
            {paymentMethod === 'Card' && (
                 <div className="py-4 text-center">
                    <p>Process card payment on the physical terminal.</p>
                </div>
            )}
            {paymentMethod === 'Mpesa' && (
                 <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mpesa-code" className="text-right">Transaction Code</Label>
                        <Input 
                            id="mpesa-code" 
                            value={mpesaCode}
                            onChange={(e) => setMpesaCode(e.target.value)}
                            className="col-span-3" 
                            placeholder="(Optional)"
                        />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mpesa-phone" className="text-right">Phone Number</Label>
                        <Input 
                            id="mpesa-phone" 
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="col-span-3" 
                            placeholder="(Optional)"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={resetCashout}>Cancel</Button>
                {paymentMethod === 'Cash' ? (
                    <Button 
                        type="submit" 
                        onClick={handleConfirmPayment}
                        disabled={parseFloat(cashReceived) < total || isNaN(parseFloat(cashReceived))}
                    >
                        Confirm Payment
                    </Button>
                ) : (
                     <Button 
                        type="button" 
                        onClick={handleConfirmPayment}
                    >
                       Confirm Payment
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-sm" id="receipt-dialog">
            <DialogHeader>
                <DialogTitle className="font-headline text-primary">Transaction Receipt</DialogTitle>
            </DialogHeader>
            {lastSale && <Receipt sale={lastSale.sale} cashReceived={lastSale.cashReceived} changeDue={lastSale.changeDue} />}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                <Button type="button" onClick={handlePrint}>Print</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
