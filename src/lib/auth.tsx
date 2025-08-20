
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  SUPPORT_STAFF: "support_staff",
} as const;

type Role = typeof ROLE[keyof typeof ROLE];

type User = {
  name: string;
  email: string;
  role: Role;
};

// Mock user data
const mockAdmin: User = {
  name: "Admin User",
  email: "admin@barbuddy.app",
  role: ROLE.ADMIN,
};

const mockManager: User = {
  name: "Manager User",
  email: "manager@barbuddy.app",
  role: ROLE.MANAGER,
};

const mockCashier: User = {
    name: "Cashier User",
    email: "cashier@barbuddy.app",
    role: ROLE.CASHIER,
};

const mockSupport: User = {
    name: "Support Staff",
    email: "support@barbuddy.app",
    role: ROLE.SUPPORT_STAFF,
};


interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Set the default user to Admin for demonstration purposes
  const [user, setUser] = useState<User | null>(mockAdmin);
  const users = [mockAdmin, mockManager, mockCashier, mockSupport];

  return (
    <AuthContext.Provider value={{ user, setUser, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
