export type Drink = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number; // For bottles, this is count. For drums, this is ml.
  unit: 'bottle' | 'ml';
  unitMl?: number; // e.g., 250 for a 250ml serving from a drum
  barcode?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: 'Admin' | 'Cashier';
  status: 'Clocked In' | 'Clocked Out';
};

export type Sale = {
  id: string;
  items: {
    drinkName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: 'Cash' | 'Mpesa';
  cashier: string;
  timestamp: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
};
