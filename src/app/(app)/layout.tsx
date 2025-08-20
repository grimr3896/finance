
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
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              {/* Can add breadcrumbs or page title here */}
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { handleThemeChange } as any);
                }
                return child;
            })}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
