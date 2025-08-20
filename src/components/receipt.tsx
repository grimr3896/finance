import type { Sale } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

type ReceiptProps = {
  sale: Sale;
  cashReceived?: number;
  changeDue: number;
};

export function Receipt({ sale, cashReceived, changeDue }: ReceiptProps) {
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    }

  return (
    <div className="bg-background text-foreground font-mono text-sm p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold font-headline">Galaxy Inn</h2>
        <p>Tel: 0712 345 678</p>
      </div>
      
      <Separator className="my-2" />

      <div className="flex justify-between">
        <span>Receipt No:</span>
        <span>{sale.id}</span>
      </div>
       {sale.mpesaReceipt && (
         <div className="flex justify-between">
            <span>M-Pesa Receipt:</span>
            <span className="truncate">{sale.mpesaReceipt}</span>
        </div>
       )}
      <div className="flex justify-between">
        <span>Date:</span>
        <span>{formatDate(sale.timestamp)}</span>
      </div>
       <div className="flex justify-between">
        <span>Cashier:</span>
        <span>{sale.cashier}</span>
      </div>
      
      <Separator className="my-2 border-dashed" />
      
      <div>
        {sale.items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-x-2 mb-1">
            <span className="truncate">{item.drinkName}</span>
            <span>x{item.quantity}</span>
            <span className="text-right">{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-2 border-dashed" />

      <div className="space-y-1">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>Ksh {sale.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span>{sale.paymentMethod}</span>
        </div>
        {sale.paymentMethod === 'Cash' && cashReceived !== undefined && (
          <>
            <div className="flex justify-between">
              <span>Cash Received:</span>
              <span>Ksh {cashReceived.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change Due:</span>
              <span>Ksh {changeDue.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <Separator className="my-2" />
      
      <div className="text-center mt-4">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
