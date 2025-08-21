
"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, ROLE } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";
import { LogOut } from "lucide-react";

export function UserNav() {
  const { user, setUser, adminPassword, secondaryAdminPassword } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { state: sidebarState } = useSidebar();

  if (!user) return null;

  const handleRoleChange = (role: string) => {
    if (role === ROLE.ADMIN) {
      setIsPasswordDialogOpen(true);
    } else if (role === ROLE.CASHIER) {
      setUser({ ...user, role: ROLE.CASHIER });
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === adminPassword || (secondaryAdminPassword && passwordInput === secondaryAdminPassword)) {
      setUser({ ...user, role: ROLE.ADMIN });
      toast({ title: "Success", description: "Switched to Admin role." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Incorrect password." });
    }
    setPasswordInput("");
    setIsPasswordDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("w-full h-auto justify-start p-2", sidebarState === 'collapsed' && 'justify-center size-8 p-0 rounded-full')}>
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col items-start", sidebarState === 'collapsed' && 'hidden')}>
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleChange}>
            <DropdownMenuLabel>Switch Role (for demo)</DropdownMenuLabel>
            <DropdownMenuRadioItem value={ROLE.ADMIN}>Admin</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ROLE.CASHIER}>Cashier</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Access Required</DialogTitle>
            <DialogDescription>
              Please enter the admin password to switch to the administrator role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handlePasswordSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
