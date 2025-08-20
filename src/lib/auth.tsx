
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export const ROLE = {
  ADMIN: "admin",
  CASHIER: "cashier",
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

const mockCashier: User = {
    name: "Cashier User",
    email: "cashier@barbuddy.app",
    role: ROLE.CASHIER,
};

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  secondaryAdminPassword: string;
  setSecondaryAdminPassword: (password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Set the default user to Admin for demonstration purposes
  const [user, setUser] = useState<User | null>(mockAdmin);
  const [adminPassword, setAdminPassword] = useState("KINGORCA");
  const [secondaryAdminPassword, setSecondaryAdminPassword] = useState("");
  const users = [mockAdmin, mockCashier];

  return (
    <AuthContext.Provider value={{ user, setUser, users, adminPassword, setAdminPassword, secondaryAdminPassword, setSecondaryAdminPassword }}>
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
