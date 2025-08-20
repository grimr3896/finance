
import type { Metadata } from 'next';
import { CompanyInfoForm } from "@/components/company-info-form";

export const metadata: Metadata = {
    title: "Settings - BarBuddy POS",
    description: "Customize application settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-headline font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
                Customize the appearance and behavior of the application.
            </p>
        </div>
        <CompanyInfoForm />
    </div>
  );
}
