
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function CompanyInfoForm() {
  const { toast } = useToast();
  const { adminPassword, setAdminPassword, secondaryAdminPassword, setSecondaryAdminPassword } = useAuth();
  
  const [companyName, setCompanyName] = useState("Galaxy Inn");
  const [companyEmail, setCompanyEmail] = useState("contact@galaxyinn.app");
  const [companyPhone, setCompanyPhone] = useState("0712 345 678");
  const [adminEmail, setAdminEmail] = useState("admin@barbuddy.app");

  const [localAdminPassword, setLocalAdminPassword] = useState(adminPassword);
  const [localSecondaryAdminPassword, setLocalSecondaryAdminPassword] = useState(secondaryAdminPassword);


  const handleSave = () => {
    setAdminPassword(localAdminPassword);
    setSecondaryAdminPassword(localSecondaryAdminPassword);
    toast({
      title: "Settings Saved",
      description: "Company information has been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Company Information</CardTitle>
        <CardDescription>
          Update your business details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-phone">Company Phone</Label>
                <Input
                id="company-phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="company-email">Public Email</Label>
                <Input
                id="company-email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    This is the authorized email for the Admin Command feature.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                id="admin-password"
                type="password"
                value={localAdminPassword}
                onChange={(e) => setLocalAdminPassword(e.target.value)}
                />
                 <p className="text-xs text-muted-foreground">
                    Password for switching to Admin role.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="secondary-admin-password">Secondary Admin Password</Label>
                <Input
                id="secondary-admin-password"
                type="password"
                value={localSecondaryAdminPassword}
                onChange={(e) => setLocalSecondaryAdminPassword(e.target.value)}
                />
                 <p className="text-xs text-muted-foreground">
                    An alternative password for the Admin role.
                </p>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
