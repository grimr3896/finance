"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { processAdminCommand, type AdminCommandOutput } from "@/ai/flows/admin-command-flow";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Mail, Loader2, BotMessageSquare } from "lucide-react";

const formSchema = z.object({
  emailContent: z.string().min(10, { message: "Email content is required." }),
});

export function AdminCommandForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminCommandOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailContent: `From: admin@barbuddy.app
Subject: Daily Report

Please provide the following reports:
- PROFIT 20-08-2025
- TOP SELLERS 20-08-2025
- STOCK ALERT`,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const commandResult = await processAdminCommand(values);
      setResult(commandResult);
    } catch (e) {
      setError("An error occurred while processing the command. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Email Command Input</CardTitle>
          <CardDescription>Simulate sending an email to the system.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="emailContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content (Subject & Body)</FormLabel>
                    <FormControl>
                      <Textarea className="h-64 font-mono text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
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
                <p className="ml-4 text-muted-foreground">AI is processing...</p>
            </div>
        )}
        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {result && (
          <Card>
            <CardContent className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.replyContent}</pre>
            </CardContent>
          </Card>
        )}
        {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BotMessageSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">The AI-generated email reply will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
