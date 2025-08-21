
export type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  price: number;
  barcode?: string;
  image?: string;
};

export type User = {
  id: string;
  username: string;
  role: 'Admin' | 'Cashier';
  email: string;
  phone: string;
  dateJoined: string; // ISO 8601 format
};

export type SaleItem = {
    id?: string; // Optional ID for the sale item itself
    drinkName: string;
    quantity: number;
    price: number;
}

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'Mpesa' | 'Card';
  cashier: string;
  timestamp: string; // ISO 8601 format
  mpesaReceipt?: string;
  mpesaPhone?: string;
};

export type Expense = {
  id:string;
  description: string;
  amount: number;
  date: string; // ISO 8601 format
};
