"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Beer,
  Users,
  BarChart3,
  BrainCircuit,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/pos",
    label: "Point of Sale",
    icon: ShoppingCart,
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Beer,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/forecasting",
    label: "AI Forecasting",
    icon: BrainCircuit,
  },
  {
    href: "/anomaly-detection",
    label: "Anomaly Detection",
    icon: ShieldAlert,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(link.href)}
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
