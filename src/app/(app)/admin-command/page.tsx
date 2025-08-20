import { AdminCommandForm } from "@/components/admin-command-form";

export default function AdminCommandPage() {
  return (
    <div>
      <h2 className="text-3xl font-headline font-bold tracking-tight">Admin Command Simulator</h2>
      <p className="text-muted-foreground mb-6">
        Test the AI-powered email command system.
      </p>
      <AdminCommandForm />
    </div>
  );
}
