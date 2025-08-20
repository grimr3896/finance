
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useAuth, ROLE } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const handleRoleChange = (role: string) => {
    if (role === ROLE.ADMIN) {
      const password = prompt("Please enter the admin password:");
      if (password === "KINGORCA") {
        setUser({ ...user, role: ROLE.ADMIN });
        toast({ title: "Success", description: "Switched to Admin role." });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Incorrect password." });
      }
    } else if (role === ROLE.CASHIER) {
      setUser({ ...user, role: ROLE.CASHIER });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
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
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
