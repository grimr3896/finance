
"use client";
import React from "react";
import { AuthProvider } from "@/lib/auth";
import { Logo } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState({ primary: "45 96% 51%", accent: "347 77% 49%" });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--accent", theme.accent);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: { primary: string; accent: string }) => {
    setTheme(newTheme);
  };

  return (
    <AuthProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo className="size-8 text-primary" />
              <h1 className="text-lg font-headline font-semibold">Galaxy Inn</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
           <SidebarFooter>
              <SidebarSeparator />
              <div className="p-2">
                 <UserNav />
              </div>
           </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="relative flex-1 overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-20 md:pt-6">
             <div className="absolute top-4 left-4 sm:left-6 md:hidden">
                <SidebarTrigger />
             </div>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    return React.cloneElement(child, { handleThemeChange });
                }
                return child;
            })}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
