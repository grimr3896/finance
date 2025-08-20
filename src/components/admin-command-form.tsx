"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { processAdminCommand } from "@/ai/flows/admin-command-flow";
import type { AdminCommandInput, AdminCommandOutput } from "@/ai/schemas/admin-command-schemas";
import { AdminCommandInputSchema } from "@/ai/schemas/admin-command-schemas";
import { useAuth, ROLE } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Send, Loader2, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdminCommandForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminCommandOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { users } = useAuth();
  
  const adminUser = users.find(u => u.role === ROLE.ADMIN)!;
  const cashierUser = users.find(u => u.role === ROLE.CASHIER)!;

  const form = useForm<AdminCommandInput>({
    resolver: zodResolver(AdminCommandInputSchema),
    defaultValues: {
      from: adminUser.email,
      subject: "Daily Profit",
      body: "PROFIT 20-08-2025",
    },
  });

  async function onSubmit(values: AdminCommandInput) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await processAdminCommand(values);
      setResult(response);
    } catch (e) {
      setError("An unexpected error occurred. Please check the console and try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Email Simulator</CardTitle>
          <CardDescription>Send a command as if it were an email.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From (Sender)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sender email" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={adminUser.email}>{adminUser.email} (Admin)</SelectItem>
                        <SelectItem value={cashierUser.email}>{cashierUser.email} (Non-Admin)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl><Textarea className="h-24 font-mono text-xs" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Process Command
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold">Generated Reply</h3>
        {loading && (
          <div className="flex items-center justify-center rounded-lg border p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Processing...</p>
          </div>
        )}
        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {result && (
            <Alert variant="default" className={cn(!result.shouldReply && "border-yellow-500/50 text-yellow-500")}>
                <Mail className={cn("h-4 w-4", !result.shouldReply && "text-yellow-500")} />
                <AlertTitle>{result.shouldReply ? "Reply Will Be Sent" : "No Reply Will Be Sent"}</AlertTitle>
                <AlertDescription className="mt-2 space-y-4">
                     <div className={cn("prose prose-sm prose-invert max-w-none rounded-md border bg-secondary p-4", !result.shouldReply && "text-foreground")}>
                        <pre className="whitespace-pre-wrap bg-transparent p-0"><code>{result.replyBody}</code></pre>
                    </div>
                </AlertDescription>
            </Alert>
        )}
      </div>
    </div>
  );
}
