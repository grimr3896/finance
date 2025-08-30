
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Beer,
  Users,
  BarChart3,
  ShoppingCart,
  Settings,
  History,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth, ROLE } from "@/lib/auth";

const allLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    href: "/pos",
    label: "Point of Sale",
    icon: ShoppingCart,
    allowedRoles: [ROLE.ADMIN, ROLE.CASHIER],
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Beer,
    allowedRoles: [ROLE.ADMIN, ROLE.CASHIER],
  },
  {
    href: "/order-history",
    label: "Order History",
    icon: History,
    allowedRoles: [ROLE.ADMIN, ROLE.CASHIER],
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    allowedRoles: [ROLE.ADMIN],
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading skeleton
  }

  const accessibleLinks = allLinks.filter(link => 
    link.allowedRoles.includes(user.role)
  );

  return (
    <SidebarMenu>
      {accessibleLinks.map((link) => (
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
